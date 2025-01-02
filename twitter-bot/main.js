const { TwitterApi } = require( "twitter-api-v2" );
const fs = require( "fs" );
const path = require( "path" );
const axios = require( "axios" );

// Twitter API credentials
const client = new TwitterApi({
	appKey: "icDKoBDN2aMCR4ciS322oQzSi",
	appSecret: "1eVELjhpIAjNOK2ujEUndHaBwVkDtjs79RDQ0tpRO7qYfzY4ZO",
	accessToken: "1874499453257736192-IIVLlQ2Dxr3C3HhViopww5SRAV5HNZ",
	accessSecret: "z913VPOlekvlGQMEWxvaRs0FIIRdYXQxZWY6f5moDUAzj",
});

// Initialize Twitter client
const twitterClient = client.readWrite;

// Constants
const SEARCH_QUERY = "#israel -is:retweet lang:en"; // Modify query as needed
const TWEET_COUNT = 10; // Number of tweets to fetch

( async () =>
{
	try
	{
		// Read tweet content
		const tweetText = fs.readFileSync( path.join( __dirname, "tweet.txt" ), "utf-8" ).trim();
		const imagePath = path.join( __dirname, "image.jpg" ); // Modify image file name if needed

		// Search for popular tweets
		const { data: tweets } = await twitterClient.v2.search( SEARCH_QUERY, {
			max_results: TWEET_COUNT,
			"tweet.fields": "public_metrics",
			expansions: "author_id",
		});

		if ( !tweets.data || !tweets.data.length )
		{
			console.log( "No tweets found for the specified query." );
			return;
		}

		let mediaId = null;

		// Check if an image exists and upload it
		if ( fs.existsSync( imagePath ) )
		{
			const imageData = fs.readFileSync( imagePath );
			const media = await twitterClient.v1.uploadMedia( imageData, { mimeType: "image/jpeg" });
			mediaId = media.media_id_string;
		}



		// Reply to each tweet
		for ( const tweet of tweets.data )
		{
			try
			{
				const reply = await twitterClient.v2.reply(
					tweetText,
					tweet.id,
					mediaId ? { media: { media_ids: [mediaId] } } : undefined
				);
				console.log( `Replied to tweet ID: ${tweet.id}` );
			}
			catch ( error )
			{
				console.error( `Failed to reply to tweet ID: ${tweet.id}`, error );
			}
		}
		// Replace the last catch block with:
	}
	catch ( error )
	{
		console.error({
			error: error.message,
			type: error.type,
			code: error.code,
			rateLimit: error.rateLimit,
			data: error.data,
			errors: error.errors
		});
	}
})();
