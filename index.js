var express  =  require( 'express' );
var cors     =  require( 'cors' );
var multer   =  require( 'multer' );
var storage  =  multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'uploads/')
    },
    filename: function (req, file, cb) {
      cb(null, Date.now() + '-' + file.originalname)
    }
  })
var upload   =  multer( { storage: storage });

var sizeOf   =  require( 'image-size' );
require( 'string.prototype.startswith' );

// CREATE EXPRESS INSTANCE
var app = express();

// CORS
var whitelist = [
  'http://localhost:3000',
  'http://cabin.surge.sh'
];
var corsOptions = {
  origin: function(origin, callback){
    // var originIsWhitelisted = whitelist.indexOf(origin) !== -1;
    var originIsWhitelisted = true
    callback(null, originIsWhitelisted);
  },
  credentials: true
};
app.use(cors(corsOptions));

app.use( express.static( __dirname + '/bower_components' ) );

app.post( '/', upload.single( 'file' ), function( req, res, next ) {
  if ( !req.file.mimetype.startsWith( 'image/' ) ) {
    return res.status( 422 ).json( {
      error : 'The uploaded file must be an image'
    } );
  }

  var dimensions = sizeOf( req.file.path );

  if ( ( dimensions.width < 640 ) || ( dimensions.height < 480 ) ) {
    return res.status( 422 ).json( {
      error : 'The image must be at least 640 x 480px'
    } );
  }

  return res.status( 200 ).send( req.file );
});

app.get('/uploads/:filename', function(req,res,next){
  var options = {
    root: __dirname + '/uploads/',
    dotfiles: 'deny',
    headers: {
        'x-timestamp': Date.now(),
        'x-sent': true
    }
  };

  var fileName = req.params.filename;
  res.sendFile(fileName, options, function (err) {
    if (err) {
      next(err);
    } else {
      console.log('Sent:', fileName);
    }
  });
});

app.listen( 8090, function() {
  console.log( 'Express server listening on port 8090' );
});
