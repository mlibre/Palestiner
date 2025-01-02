const { TwitterApi } = require( "twitter-api-v2" );
const fs = require( "fs" );
const path = require( "path" );

// Twitter API credentials
const client = new TwitterApi({
	appKey: process.env.appKey,
	appSecret: process.env.appSecret,
	accessToken: process.env.accessToken,
	accessSecret: process.env.accessSecret,
});

// Initialize Twitter client
const twitterClient = client.readWrite;

// Constants
const SEARCH_QUERY = "(I stand with Israel) OR #IStandWithIsrael -is:retweet lang:en"; // Updated query
const TWEET_COUNT = 100; // Number of tweets to fetch
const TWEETS_DIR = path.join( __dirname, "tweets" ); // Directory containing tweet data

( async () =>
{
	try
	{
		// Search for popular tweets
		const { data: tweets } = await twitterClient.v2.search( SEARCH_QUERY, {
			max_results: TWEET_COUNT,
			"tweet.fields": "public_metrics",
		});

		if ( !tweets.data || !tweets.data.length )
		{
			console.log( "No tweets found for the specified query." );
			return;
		}

		// Find the tweet with the most likes
		const mostLikedTweet = tweets.data.reduce( ( max, tweet ) =>
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
			mediaId = media.media_id_string;
		}

		// Post the reply
		if ( tweetText )
		{
			await twitterClient.v2.reply(
				tweetText,
				mostLikedTweet.id,
				mediaId ? { media: { media_ids: [mediaId] } } : undefined
			);
			console.log( `Replied to tweet ID: ${mostLikedTweet.id} with content from folder: ${randomFolder}` );
		}
		else
		{
			console.error( "No tweet text found in the selected folder." );
		}
	}
	catch ( error )
	{
		console.error({
			message: error.message,
			type: error.type,
			code: error.code,
			rateLimit: error.rateLimit,
			data: error.data,
			errors: error.errors
		});
	}
})();
