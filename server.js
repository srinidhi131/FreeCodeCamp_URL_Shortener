require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
mongoose = require("mongoose");
const { Schema } = mongoose;
const shortId = require('shortid');
var bodyParser = require('body-parser');
const validUrl = require('valid-url');

mongoose.connect(process.env.MONGO_URI , 
{ useNewUrlParser: true, 
useUnifiedTopology: true
});

let URIModel;

const URISchema = new Schema({
    original_url:  String ,
    short_url: String
  });

URIModel = mongoose.model('URI', URISchema);
// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use(bodyParser.json());

app.use(bodyParser.urlencoded({ extended: false }));

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});


app.post("/api/shorturl",async function(req,res){
  var url = req.body.url;
  const shorturl = shortId.generate()

  if(!validUrl.isWebUri(url)){
    res.json({
      "error": 'invalid url'
    })
  }
  else{
    let record = await URIModel.findOne({original_url: url})
    if(record){
      res.json({
        "original_url" : record.original_url,
        "short_url" : record.short_url
      })
    }
    else{
      let newRecord = URIModel({
        original_url : url,
        short_url : shorturl
      })
      await newRecord.save()
      res.json({
        "original_url" : newRecord.original_url,
        "short_url" : newRecord.short_url
      })
    }
  }
});

app.get("/api/shorturl/:shortURLfind?",async function(req,res){
  const urlToFind = await URIModel.findOne({
    short_url : req.params.shortURLfind})
  if(urlToFind){
    return res.redirect(urlToFind.original_url)
  }
  else{
  res.json({
      error: 'invalid url'
    })
  }
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
