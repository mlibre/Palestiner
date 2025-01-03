/* eslint-disable no-loop-func */
const { TwitterApi } = require( "twitter-api-v2" );
const fs = require( "fs" );
const path = require( "path" );

const DB_PATH = path.join( __dirname, "db.json" );

function loadDatabase ()
{
	if ( !fs.existsSync( DB_PATH ) )
	{
		fs.writeFileSync( DB_PATH, JSON.stringify({ tweetHistory: [] }) );
	}
	return JSON.parse( fs.readFileSync( DB_PATH, "utf-8" ) );
}

function saveDatabase ( data )
{
	fs.writeFileSync( DB_PATH, JSON.stringify( data, null, 2 ) );
}

function hasPostedToAuthorToday ( authorId, accountIndex )
{
	const db = loadDatabase();
	const today = new Date().toISOString().split( "T" )[0];

	return db.tweetHistory.some( entry =>
	{
		return entry.authorId === authorId &&
        entry.accountIndex === accountIndex &&
        entry.date.startsWith( today )
	});
}

function recordTweetHistory ( authorId, accountIndex, tweetId )
{
	const db = loadDatabase();
	db.tweetHistory.push({
		authorId,
		accountIndex,
		tweetId,
		date: new Date().toISOString()
	});
	saveDatabase( db );
}


function getTwitterAccounts ()
{
	const accounts = [];
	let accountNum = 1;

	while ( process.env[`apiKey${accountNum}`] )
	{
		accounts.push({
			appKey: process.env[`apiKey${accountNum}`],
			appSecret: process.env[`apiSecret${accountNum}`],
			accessToken: process.env[`accessToken${accountNum}`],
			accessSecret: process.env[`accessSecret${accountNum}`],
		});
		accountNum++;
	}

	return accounts;
}

const twitterAccounts = getTwitterAccounts();

// Constants
const SEARCH_QUERY = "#proudzionism OR #HamasisISIS OR #NeverAgainIsNow OR #HappyHanukkah OR #HamasTerrorist OR #BringThemHomeNow OR #IStandWithIsrael -is:retweet lang:en";
const TWEET_COUNT = 10;
const TWEETS_DIR = path.join( __dirname, "tweets" );

function initializeTwitterClient ( credentials )
{
	const client = new TwitterApi( credentials );
	return client.readWrite;
}

async function postTweet ( twitterClient, tweetText, replyToId, mediaId )
{
	return await twitterClient.v2.reply(
		tweetText,
		replyToId,
		mediaId ? { media: { media_ids: [mediaId] } } : undefined
	);
}

( async () =>
{
	let success = false;
	let currentAccountIndex = 0;

	while ( !success && currentAccountIndex < twitterAccounts.length )
	{
		try
		{
			const twitterClient = initializeTwitterClient( twitterAccounts[currentAccountIndex] );

			// Search for popular tweets
			const { data: tweets } = await twitterClient.v2.search( SEARCH_QUERY, {
				max_results: TWEET_COUNT,
				"tweet.fields": "public_metrics",
		      expansions: ["author_id"],
			});

			if ( !tweets.data || !tweets.data.length )
			{
				console.log( "No tweets found for the specified query." );
				return;
			}

			for ( let i = 0; i < tweets.data.length; i++ )
			{
				tweets.data[i].username = tweets.includes.users[i].username;
			}

			// Filter out authors we've already posted to today
			const filteredTweets = tweets.data.filter( tweet =>
			{ return !hasPostedToAuthorToday( tweet.author_id, currentAccountIndex ) });

			if ( filteredTweets.length === 0 )
			{
				console.log( "No new tweets to reply to with this account today." );
				currentAccountIndex++;
				continue;
			}

			// Find the tweet with the most likes
			const mostLikedTweet = filteredTweets.reduce( ( max, tweet ) =>
			{ return max.public_metrics.like_count > tweet.public_metrics.like_count ? max : tweet });

			console.log( `Most liked tweet ID: ${mostLikedTweet.id}, Likes: ${mostLikedTweet.public_metrics.like_count}` );

			// Get all folders in the tweets directory
			const folders = fs
			.readdirSync( TWEETS_DIR, { withFileTypes: true })
			.filter( ( dirent ) => { return dirent.isDirectory() })
			.map( ( dirent ) => { return dirent.name });

			if ( folders.length === 0 )
			{
				console.error( "No folders found in the tweets directory." );
				return;
			}

			// Select a random folder
			const randomFolder = folders[Math.floor( Math.random() * folders.length )];
			const folderPath = path.join( TWEETS_DIR, randomFolder );

			// Read tweet text
			const tweetTextPath = path.join( folderPath, "tweet.txt" );
			const tweetText = fs.existsSync( tweetTextPath )
				? fs.readFileSync( tweetTextPath, "utf-8" ).trim()
				: null;

			// Upload image if it exists
			const imagePath = path.join( folderPath, "image.png" );
			let mediaId = null;
			if ( fs.existsSync( imagePath ) )
			{
				const media = await twitterClient.v1.uploadMedia( imagePath );
				mediaId = media;
			}

			// Post the reply
			if ( tweetText )
			{
				const response = await postTweet( twitterClient, tweetText, mostLikedTweet.id, mediaId );
				const tweetId = response.data.id;
				const authorUsername = mostLikedTweet.username;
				const tweetUrl = `https://x.com/${authorUsername}/status/${tweetId}`;
				console.log( `Tweet URL: ${tweetUrl}` );
				console.log( `Successfully posted using account ${currentAccountIndex + 1}` );
				console.log( `Replied to tweet ID: ${mostLikedTweet.id} with content from folder: ${randomFolder}` );
				success = true;
				recordTweetHistory( mostLikedTweet.author_id, currentAccountIndex, mostLikedTweet.id );
			}
			else
			{
				console.error( "No tweet text found in the selected folder." );
			}
		}
		catch ( error )
		{
			console.error( `Failed with account ${currentAccountIndex + 1}:`, {
				message: error.message,
				type: error.type,
				code: error.code,
				rateLimit: error.rateLimit,
				data: error.data,
				errors: error.errors
			});
			currentAccountIndex++;
		}
	}

	if ( !success )
	{
		console.error( "All accounts failed to post the tweet." );
	}
})();
