// Tracks a twitter stream on a specific keyword then tries to pull a color out of the text
// USAGE: node twitter_tree.js 'Twitter-Key' 'Twitter-Key' 'Twitter-Key' 'Twitter-Key' "Elastisearch endpoint" "Elasticsearch index name" "#HashTag"

var colours = {
    "burntorange": "#ff6600",
    "hokieorange": "#ff6600",
    "hokiemaroon": "#660000",
    "chicagomaroon": "#660000",
    "lightpink": "#FFB6C1",
    "pink": "#FFC0CB",
    "crimson": "#DC143C",
    "lavenderblush": "#FFF0F5",
    "palevioletred": "#DB7093",
    "hotpink": "#FF69B4",
    "deeppink": "#FF1493",
    "mediumvioletred": "#C71585",
    "orchid": "#DA70D6",
    "thistle": "#D8BFD8",
    "plum": "#DDA0DD",
    "violet": "#EE82EE",
    "fuchsia": "#FF00FF",
    "darkmagenta": "#8B008B",
    "purple": "#800080",
    "mediumorchid": "#BA55D3",
    "darkviolet": "#9400D3",
    "darkorchid": "#9932CC",
    "indigo": "#4B0082",
    "blueviolet": "#8A2BE2",
    "mediumpurple": "#9370DB",
    "mediumslateblue": "#7B68EE",
    "slateblue": "#6A5ACD",
    "darkslateblue": "#483D8B",
    "ghostwhite": "#F8F8FF",
    "lavender": "#E6E6FA",
    "blue": "#0000FF",
    "mediumblue": "#0000CD",
    "darkblue": "#00008B",
    "navy": "#000080",
    "midnightblue": "#191970",
    "royalblue": "#4169E1",
    "cornflowerblue": "#6495ED",
    "lightsteelblue": "#B0C4DE",
    "lightslategray": "#778899",
    "slategray": "#708090",
    "dodgerblue": "#1E90FF",
    "aliceblue": "#F0F8FF",
    "steelblue": "#4682B4",
    "lightskyblue": "#87CEFA",
    "skyblue": "#87CEEB",
    "deepskyblue": "#00BFFF",
    "lightblue": "#ADD8E6",
    "powderblue": "#B0E0E6",
    "cadetblue": "#5F9EA0",
    "darkturquoise": "#00CED1",
    "azure": "#F0FFFF",
    "lightcyan": "#E0FFFF",
    "paleturquoise": "#AFEEEE",
    "aqua": "#00FFFF",
    "darkcyan": "#008B8B",
    "teal": "#008080",
    "darkslategray": "#2F4F4F",
    "mediumturquoise": "#48D1CC",
    "lightseagreen": "#20B2AA",
    "turquoise": "#40E0D0",
    "aquamarine": "#7FFFD4",
    "mediumaquamarine": "#66CDAA",
    "mediumspringgreen": "#00FA9A",
    "mintcream": "#F5FFFA",
    "springgreen": "#00FF7F",
    "mediumseagreen": "#3CB371",
    "seagreen": "#2E8B57",
    "honeydew": "#F0FFF0",
    "darkseagreen": "#8FBC8F",
    "palegreen": "#98FB98",
    "limegreen": "#32CD32",
    "lime": "#00FF00",
    "forestgreen": "#228B22",
    "green": "#008000",
    "darkgreen": "#006400",
    "lawngreen": "#7CFC00",
    "chartreuse": "#7FFF00",
    "greenyellow": "#ADFF2F",
    "darkolivegreen": "#556B2F",
    "yellowgreen": "#9ACD32",
    "olivedrab": "#6B8E23",
    "ivory": "#FFFFF0",
    "beige": "#F5F5DC",
    "lightyellow": "#FFFFE0",
    "lightgoldenrodyellow": "#FAFAD2",
    "yellow": "#FFFF00",
    "olive": "#808000",
    "darkkhaki": "#BDB76B",
    "palegoldenrod": "#EEE8AA",
    "lemonchiffon": "#FFFACD",
    "khaki": "#F0E68C",
    "gold": "#FFD700",
    "cornsilk": "#FFF8DC",
    "goldenrod": "#DAA520",
    "darkgoldenrod": "#B8860B",
    "floralwhite": "#FFFAF0",
    "oldlace": "#FDF5E6",
    "wheat": "#F5DEB3",
    "orange": "#FFA500",
    "moccasin": "#FFE4B5",
    "papayawhip": "#FFEFD5",
    "blanchedalmond": "#FFEBCD",
    "navajowhite": "#FFDEAD",
    "antiquewhite": "#FAEBD7",
    "tan": "#D2B48C",
    "burlywood": "#DEB887",
    "darkorange": "#FF8C00",
    "bisque": "#FFE4C4",
    "linen": "#FAF0E6",
    "peru": "#CD853F",
    "peachpuff": "#FFDAB9",
    "sandybrown": "#F4A460",
    "chocolate": "#D2691E",
    "saddlebrown": "#8B4513",
    "seashell": "#FFF5EE",
    "sienna": "#A0522D",
    "lightsalmon": "#FFA07A",
    "coral": "#FF7F50",
    "orangered": "#FF4500",
    "darksalmon": "#E9967A",
    "tomato": "#FF6347",
    "salmon": "#FA8072",
    "mistyrose": "#FFE4E1",
    "lightcoral": "#F08080",
    "snow": "#FFFAFA",
    "rosybrown": "#BC8F8F",
    "indianred": "#CD5C5C",
    "red": "#FF0000",
    "brown": "#A52A2A",
    "firebrick": "#B22222",
    "darkred": "#8B0000",
    "maroon": "#800000",
    "white": "#FFFFFF",
    "whitesmoke": "#F5F5F5",
    "gainsboro": "#DCDCDC",
    "lightgrey": "#D3D3D3",
    "silver": "#C0C0C0",
    "darkgray": "#A9A9A9",
    "gray": "#808080",
    "dimgray": "#696969"
};
var R = require('ramda');

var consumer_key = process.argv[2],
    consumer_secret = process.argv[3],
    access_token_key = process.argv[4],
    access_token_secret = process.argv[5],
    elasticsearch_endpoint = process.argv[6],
    elasticsearch_index = process.argv[7],
    track = process.argv[8];

var twitter_api = require('twitter'),
    twitter = new twitter_api({
        consumer_key: consumer_key,
        consumer_secret: consumer_secret,
        access_token_key: access_token_key,
        access_token_secret: access_token_secret,
    });

var elasticCreate = (function(endpoint, index) {
    var client = require('elasticsearch').Client({
        host: endpoint,
        log: 'error'
    });
    return function create(body) {
        return client.index({
            index: index,
            type: 'twitter-tree-doc',
            body: body
        });
    }
})(elasticsearch_endpoint, elasticsearch_index);

var count = 0,
    utils = require('util');

var split = R.split(' ');
var filterColors = R.filter(R.either(isHexColor, matchWordColor));
var getFirstItem = function(words) { return words[0]; };
var getUndefined = function() { return undefined; };
var wordToHex = R.ifElse(matchWordColor, matchWordColor, R.identity);
var convertColor = R.compose(wordToHex, getFirstItem);
var getFirstColor = R.ifElse(R.compose(R.not, R.isEmpty), convertColor, getUndefined);
var getColor = R.compose(getFirstColor, filterColors, split);

twitter.stream('statuses/filter', {track: track}, function(stream) {
    console.log("tracking" + track);
    stream.on('data', function(tweet) {
//    Add Elasticsearch Client?
        if(tweet.lang.indexOf("en") > -1){

            console.log("Heard Tweet: " + tweet.text);
            console.log("Finding Color");

            var hexColor = getColor(tweet.text);
            if (!hexColor) {
                console.log('No color found in tweet.');
                return;
            }

            var color = hexToRgb(hexColor);

            if (colorTooDark(color)) {
                console.log('Color is too dark for tree, skipping: ' + JSON.stringify(color));
                return;
            }
            console.log("Sending color to Tree: R:" + color.r + " G: " + color.g + " B: " + color.b);

            var elasticObj = {
                user: tweet.user.screen_name,
                text: tweet.text,
                hexColor: hexColor,
                rgbColor: color,
                timestamp: (new Date()).getTime()
            };

            elasticCreate(elasticObj).catch(function(err) {
                console.log('There was an error saving this tweet to elasticsearch.\n\n'+err);
            });
        }
    });

    stream.on('error', function(error) {
        console.log(error);
    });
});

function colorTooDark(rgb) {
    RsRGB = rgb.r/255;
    GsRGB = rgb.g/255;
    BsRGB = rgb.b/255;

    if (RsRGB <= 0.03928) {R = RsRGB / 12.92;} else {R = Math.pow(((RsRGB + 0.055) / 1.055), 2.4);}
    if (GsRGB <= 0.03928) {G = GsRGB / 12.92;} else {G = Math.pow(((GsRGB + 0.055) / 1.055), 2.4);}
    if (BsRGB <= 0.03928) {B = BsRGB / 12.92;} else {B = Math.pow(((BsRGB + 0.055) / 1.055), 2.4);}
    return (0.2126 * R) + (0.7152 * G) + (0.0722 * B) < 0.025;
}

function matchWordColor(color){
    if (typeof colours[color.toLowerCase()] != 'undefined')
        return colours[color.toLowerCase()];
    return false;
}

function isHexColor(word) {
    return /(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i.test(word);
}

function hexToRgb(hex) {
    // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
    var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex, function(m, r, g, b) {
        return r + r + g + g + b + b;
    });

    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}
