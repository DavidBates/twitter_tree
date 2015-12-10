using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Runtime.InteropServices.WindowsRuntime;
using Windows.Foundation;
using Windows.Foundation.Collections;
using Windows.UI.Xaml;
using Windows.UI.Xaml.Controls;
using Windows.UI.Xaml.Controls.Primitives;
using Windows.UI.Xaml.Data;
using Windows.UI.Xaml.Input;
using Windows.UI.Xaml.Media;
using Windows.UI.Xaml.Navigation;
using Windows.UI.Core;
using Tweetinvi;
using Windows.UI.Xaml.Media.Imaging;
using Tweetinvi.Core.Interfaces;
using System.Net.Http;
using System.Threading.Tasks;
using Windows.Data.Json;
using Windows.UI;

namespace Last2Tweets
{

    public sealed partial class MainPage : Page
    {
        //Set these before running. 
        private string elasticsearchEndpoint = "";
        private string twitterConsumerKey = "";
        private string twitterConsumerSecret = "";
        private string twitterAccessToken = "";
        private string twitterAccessSecret = "";

        //Needed throughout
        private DispatcherTimer timer = new DispatcherTimer();
        private JsonObject oldTweet1 = null; //used for comparison and limiting twitter api v1.1 calls


        public MainPage()
        {
            this.InitializeComponent();
            Loaded += MainPage_Loaded;
        }

        private void MainPage_Loaded(object sender, RoutedEventArgs e)
        {

            if(elasticsearchEndpoint.Equals("") || twitterAccessToken.Equals("") || twitterAccessSecret.Equals("") || twitterConsumerKey.Equals("") || twitterConsumerSecret.Equals(""))
            {
                var error = "No Twitter Credentials or Elasticsearch Endpoint Found, Cannot Continue";
                tweetText1.Text = error;
                tweetText2.Text = error;
                tweetText1.Foreground = new SolidColorBrush(Colors.LightCoral);
                tweetText2.Foreground = new SolidColorBrush(Colors.LightCoral);
                return;
            }
            //Twitter credentials will be stored globably with tweetinvi 
            Auth.SetUserCredentials(twitterConsumerKey, twitterConsumerSecret, twitterAccessToken, twitterAccessSecret);
            
            //Need to check once a second for new content
            timer.Interval = TimeSpan.FromSeconds(1);
            timer.Tick += UpdateFromElasticsearch;
            timer.Start();
            
        }

        private void UpdateFromElasticsearch(object sender, object e)
        {
            var task = getlastTwo();
        }

        private async Task getlastTwo()
        {
            using (var httpClient = new HttpClient())
            {
                var json = await httpClient.GetStringAsync(elasticsearchEndpoint + "/twitter-tree/_search/?sort=timestamp:desc&size=2");
                if(json != null)
                {
                    //Parse returned results ultimatly we need the RGB value, the text, and the username. 
                    JsonObject jsonObj = JsonObject.Parse(json);
                    JsonObject hits = JsonObject.Parse(jsonObj["hits"].ToString());
                    JsonArray hitsHits = JsonArray.Parse(hits["hits"].ToString());
                    JsonObject tweet1 = JsonObject.Parse(JsonObject.Parse(hitsHits.ElementAt(0).ToString())["_source"].ToString());
                    JsonObject tweetColor1 = JsonObject.Parse(tweet1["rgbColor"].ToString());
                    JsonObject tweet2 = JsonObject.Parse(JsonObject.Parse(hitsHits.ElementAt(1).ToString())["_source"].ToString());
                    JsonObject tweetColor2 = JsonObject.Parse(tweet2["rgbColor"].ToString());

                    //Be carefull how many times you call out to get a user's picture. Twitter API V1.1 has limits
                    //See https://dev.twitter.com/rest/public/rate-limiting for more info
                    if (oldTweet1 != null && oldTweet1.ToString().Equals(tweet1.ToString()))
                    {
                        return; 
                    }
                    oldTweet1 = tweet1;

                    //Get user image and update display
                    await Dispatcher.RunAsync(CoreDispatcherPriority.High, () =>
                    {
                        IUser user = User.GetUserFromScreenName(tweet1["user"].GetString());
                        if (user != null)
                        {
                            tweetUser1.Source = new BitmapImage(new Uri(user.ProfileImageUrlFullSize, UriKind.Absolute));
                        }

                        user = User.GetUserFromScreenName(tweet2["user"].GetString());
                        if(user != null)
                        {
                            tweetUser2.Source = new BitmapImage(new Uri(user.ProfileImageUrlFullSize, UriKind.Absolute));
                        }

                        this.tweetText1.Text = tweet1["text"].ToString();
                        this.tweetText2.Text = tweet2["text"].ToString();
                        color1.Fill = new SolidColorBrush(Color.FromArgb(255, Byte.Parse(tweetColor1["r"].ToString()), Byte.Parse(tweetColor1["g"].ToString()), Byte.Parse(tweetColor1["b"].ToString())));
                        color2.Fill = new SolidColorBrush(Color.FromArgb(255, Byte.Parse(tweetColor2["r"].ToString()), Byte.Parse(tweetColor2["g"].ToString()), Byte.Parse(tweetColor2["b"].ToString())));
                    });


                }
                
            }
        }

        private void Page_Unloaded(object sender, RoutedEventArgs e)
        {
            timer.Stop();
        }
    }
}
