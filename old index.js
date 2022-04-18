const express = require('express');
const upload = require('express-fileupload');
const fs = require('fs');
ffmpeg = require('fluent-ffmpeg');
const SpeechToTextV1 = require('ibm-watson/speech-to-text/v1');

const app = express();

app.use(upload());

ffmpeg.setFfmpegPath("C:/ffmpeg/bin/ffmpeg.exe");

const { IamAuthenticator } = require('ibm-watson/auth');
const speechToText = new SpeechToTextV1({
  authenticator: new IamAuthenticator({
    apikey: '0wn61okY7HE-HY-eU_eZTXjHUXw7CkVXyKECSJrCEpfN',
  }),
  serviceUrl: 'https://api.eu-gb.speech-to-text.watson.cloud.ibm.com/instances/b447c6c0-3c83-415a-b5c4-f8d537b54337',
});

const params = {
  objectMode: true,
  contentType: 'audio/mp3',
  model: 'en-US_BroadbandModel',
  keywords: ['colorado', 'tornado', 'tornadoes'],
  keywordsThreshold: 0.5,
  maxAlternatives: 3,
};
app.post('/', (req,res)=>{
  if(req.files){
    //console.log(req.files);
    var file= req.files.data;
    var filename = file.name;
    firstname = filename.split('.')[0];
    file.mv(__dirname+'/video/'+filename, function(err){
      if(err){ console.log(err); }
      else{ console.log("Video File Saved!"); }
    });
  }
  ffmpeg(__dirname+'/video/'+filename)
    //.addInputOption('-acodec libopus')
    //.noVideo()
    .toFormat('mp3')
    .on('end',function(){
    console.log("Audio File Saved");
    IBM();
  })
    .on('error',function(){
      console.log("Error occured");
    })
    .saveToFile(__dirname+'/audio/'+firstname+'.mp3', ()=>{
      //console.log("Audio File Saved");
    });

    function IBM(){
    const recognizeStream = speechToText.recognizeUsingWebSocket(params);
    fs.createReadStream(__dirname+"/audio//"+firstname+".mp3").pipe(recognizeStream);
    recognizeStream.on('data', function(event) { onEvent('Data:', event); });
    da = "";
    console.log("File Uploaded");
    function onEvent(name, event) {
      res.send(event);
        //console.log(event);
        for(i in event["results"]){
            da = da + event["results"][i]["alternatives"][0]["transcript"];
        }}
        fs.appendFile(__dirname+'/transcripts/'+firstname+'.txt', da, function (err) {
          if (err) throw err;
          console.log('Text File Saved!');

          res.sendFile(__dirname+"/transcripts/"+firstname+'.txt', function(err){
              if(err){ console.log("Error while sending");}
              console.log('Send Successfully');
          });
        });
  }

});


app.listen(3000,function(err){
  console.log("Server running");
});
