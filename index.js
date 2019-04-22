/* eslint-disable  func-names */
/* eslint-disable  no-console */

const Alexa = require('ask-sdk');
const https = require('https');
//const jsdom = require("jsdom");


//Global variables
global.event_links = [];
global.libraryNameReceived = '';
var libraries = ['Accounting',' Architecture and Fine Arts','Doheny','Business', 'Grand Depository', 'Leavey', 'Music', 'Norris Medical', 'Science And Engineering', 'Special Collections', 'VKC', 'Dental']
let searchType = 'any'
let all_lib = 'We support the following libraries: Accounting\n Architecture and Fine Arts \n Doheny \n Business \n Grand Depository \n Leavey \n Music \n Norris Medical \n Science And Engineering\n Special Collections\n VKC \
 \n Wilson Dental. '


//--------------------------------- CONSTANTS ---------------------------------

const SKILL_NAME = 'USC Libraries Events';
const HELP_MESSAGE = 'You can ask me for library hours or about library events... How may I help you?';
const SPEECH_HELP= 'Is there anything else I can help you with? Would you like to look up library hours <break time="0.4s"/> or search for events ?'
const HELP_REPROMPT_1 = 'You can ask me for library hours or about library events.';
const HELP_REPROMPT_2 = 'What else can I help you with? Ask me for library hours or library events at USC.';
const STOP_MESSAGE = 'Thank you for your time. Goodbye and Fight on! ';

const ABOUTUSC = 'The University of Southern California is a private research university \
in Los Angeles, California. Founded in 1880, it is the oldest private research university in California. \
USC has historically educated a large number of the nation\'s business leaders and professionals.';



//SEARCH THIS
const NUMBER = 3;

const skillBuilder = Alexa.SkillBuilders.custom();

const API_KEY = '<API_KEY>';
const API_KEY_2 = '<API_KEY>';

const QUERY_TYPE = 'LibraryCatalog'; //'Everything';
const TOPIC = 'Hemingway Ernest';
const QUERY = encodeURIComponent(TOPIC);
const SEARCH_TYPE = 'any'; //default


//17 library names
const libnames = [ 'ACCOUNTING','AFA','CINEMA','DOHENY','EAST','BUSINESS','GRANDDEPOS','LEAVEY','MUSIC','MED',
'ONEARCHIVE','PHILOSOPHY','SCIENCE','SPECCOLL','VKC','DEN'];

const displaynames = ['Accounting','Architecture and Fine Arts','Cinematic Arts','Doheny',
'Gaughan and Tiberti','Grand Avenue','Leavey','Music','Norris Medical',
'ONE Archives','Hoose Library of Philosophy','Science and Engineering','Special Collections','VKC',
'Wilson Dental'];

// --------------------------------- DEFAULT HANDLERS ---------------------------------

const StartFAQsHandler = {
  
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return (request.type === 'LaunchRequest' || request.type === 'IntentRequest' &&
    request.intent.name === 'StartIntent');
  },
  
  handle(handlerInput) {
    console.log('Start FAQ -Intent Received: %j', handlerInput.requestEnvelope.request.intent)
    var sessionAttributes =  handlerInput.attributesManager.getSessionAttributes()
    console.log('Session Attributes %j',sessionAttributes)
    const speechOutput = 'Hello Trojan! Helen of Troy welcomes you to USC Library Events.'
    + ' Would you like to look up library hours <break time="0.3s"/> or search library events?'
    const Output = 'Hello Trojan! Helen of Troy welcomes you to USC Library Events.'
    + ' Would you like to look up library hours or search library events?'
    searchType = 'any'
    sessionAttributes = {
        'number': 3,
        'type': 'none',
        'stop_triggered': false,
        'update_number':false,
        'libname':'none',
        'daydate':'none'
    };
    handlerInput.attributesManager.setSessionAttributes(sessionAttributes);  
    return handlerInput.responseBuilder
      .speak(speechOutput)
      .withSimpleCard(SKILL_NAME, Output)
      .reprompt(HELP_REPROMPT_2)
      .getResponse();
  },
};

const HelpHandler = {
  
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return (request.type === 'LaunchRequest' || request.type === 'IntentRequest' &&
      request.intent.name === 'AMAZON.HelpIntent');
  },
  
  handle(handlerInput) {
    var sessionAttributes =  handlerInput.attributesManager.getSessionAttributes()
    sessionAttributes['stop_triggered'] = false
    handlerInput.attributesManager.setSessionAttributes(sessionAttributes);  
    return handlerInput.responseBuilder
      .speak(HELP_MESSAGE)
      .withSimpleCard(SKILL_NAME, HELP_MESSAGE)
      .reprompt(HELP_REPROMPT_2)
      .getResponse();
  },
};

const ExitHandler = {
  
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest' &&
      (request.intent.name === 'AMAZON.CancelIntent' ||
        request.intent.name === 'AMAZON.StopIntent');
  },
  
  handle(handlerInput) {
    var sessionAttributes =  handlerInput.attributesManager.getSessionAttributes()
    if(sessionAttributes['stop_triggered']){
      return handlerInput.responseBuilder
      .speak(STOP_MESSAGE)
      .withSimpleCard(SKILL_NAME, STOP_MESSAGE)
      .getResponse();
      
    }
    sessionAttributes['stop_triggered'] = true
    handlerInput.attributesManager.setSessionAttributes(sessionAttributes);
    return handlerInput.responseBuilder
      .speak('Is there anything else I can help you with? Say stop again to exit.')
      .withSimpleCard(SKILL_NAME, 'Is there anything else I can help you with? Say stop again to exit.')
      .reprompt('Is there anything else I can help you with? Say stop again to exit. ')
      .getResponse();
    
  },
};




const ListLibrariesIntentHandler = {
  
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return  request.type === 'IntentRequest' &&
      request.intent.name === 'ListLibrariesIntent';
  },
  
  async handle(handlerInput) {
    console.log('ListLibrariesIntent Handler- Intent Received: %j', handlerInput.requestEnvelope.request.intent)
    var sessionAttributes =  handlerInput.attributesManager.getSessionAttributes()
    console.log('Session Attributes %j',sessionAttributes)
    var follow_up_message = ''
    if(sessionAttributes['type'] == 'libhours'){
      follow_up_message = ' Which library should I look up the hours for? \n '
    }else{
      follow_up_message = HELP_MESSAGE
    }
    let sp_o ='Sure, here are the list of libraries we support:  <break time="0.2s"/>\n'
    let o ='List of libraries:\n'
    for (var lib in displaynames) {
      sp_o+= displaynames[lib] +'<break time="0.2s"/> \n'
      o+= displaynames[lib]+'\n'
    }
    
    sessionAttributes['stop_triggered'] = false
    handlerInput.attributesManager.setSessionAttributes(sessionAttributes);
    return handlerInput.responseBuilder
      .speak(sp_o + '<break time="0.3s"/>'+ follow_up_message)
      .withSimpleCard(SKILL_NAME, o + follow_up_message)
      .reprompt(o+follow_up_message)
      .getResponse();
  },
};


const LibraryHoursIntentHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
      return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'LibraryHoursIntent';
  },

  handle(handlerInput) {
  console.log('LibraryHoursIntent Handler- Intent Received: %j', handlerInput.requestEnvelope.request.intent)
  var sessionAttributes =  handlerInput.attributesManager.getSessionAttributes()
  console.log('Session Attributes %j',sessionAttributes)
  const slots = handlerInput.requestEnvelope.request.intent.slots;
  sessionAttributes['type'] = 'libhours'
  sessionAttributes['dayDate'] = 'none'
  sessionAttributes['libname'] = 'none'
  sessionAttributes['stop_triggered'] = false
  handlerInput.attributesManager.setSessionAttributes(sessionAttributes);
  console.log('Search Type is '+ sessionAttributes['type'])
  return handlerInput.responseBuilder
      .speak('Sure, Which day are you looking for? you can say library hours on monday <break time="0.3s"/> or hours on November 30')
      .reprompt(' Which day are you looking for? ' )
      .withSimpleCard(SKILL_NAME, 'Which day are you looking for? ')
      .getResponse();
       
  },
};



const LibraryNameIntentHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
      return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name == 'LibraryNameIntent';
  },

  handle(handlerInput) {

  console.log('LibaryNameIntent Handler- Intent Received: %j', handlerInput.requestEnvelope.request.intent)
  var sessionAttributes =  handlerInput.attributesManager.getSessionAttributes()
  var type = sessionAttributes['type']
  console.log('Session Attributes %j',sessionAttributes)
  const slots = handlerInput.requestEnvelope.request.intent.slots;
  var reply = slots.libraryName.value
  console.log("User Said --- " + reply )
  console.log('Search Type is '+ type)
  sessionAttributes['libname'] = reply
  sessionAttributes['stop_triggered'] = false
  if(type == 'none'){
    return HelpHandler.handle(handlerInput)
  }
  handlerInput.attributesManager.setSessionAttributes(sessionAttributes);
  if(sessionAttributes['dayDate'] != 'none' && type =='libhours'){
        return TimeSearchHandler.handle(handlerInput)
  }
  if(type == 'none'){
    return HelpHandler.handle(handlerInput)
  }
  return handlerInput.responseBuilder
      .speak('Sure, Please tell me the day you are looking for.')
      .reprompt('Sure, Please tell me the day you are looking for.' )
      .withSimpleCard(SKILL_NAME, 'Sure, Please tell me the day you are looking for.')
      .getResponse();
       
  },
};


const TimeIntentHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
      return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'TimeIntent';
  },

  handle(handlerInput) {
  console.log('Time Handler- Intent Received: %j', handlerInput.requestEnvelope.request.intent)
  var sessionAttributes =  handlerInput.attributesManager.getSessionAttributes()
  console.log('Session Attributes %j',sessionAttributes)
  const slots = handlerInput.requestEnvelope.request.intent.slots;
  var reply =''
  if(slots['dayDate'] == undefined){
     reply = getTodayDate()
  }else{
     reply = slots['dayDate'].value;
  }
  console.log("User Said --- " + reply )
  console.log('Search Type is '+ sessionAttributes['type'])
  if(sessionAttributes['type'] == 'none'){
    return HelpHandler.handle(handlerInput)
  }
  sessionAttributes['dayDate'] = reply
  sessionAttributes['stop_triggered'] = false
  handlerInput.attributesManager.setSessionAttributes(sessionAttributes);
  if(sessionAttributes['type'] != 'libhours'){
    return EventsSearchHandler.handle(handlerInput)
  }
  if(sessionAttributes['libname'] != 'none'){
    return TimeSearchHandler.handle(handlerInput)
  }
  
  
  return handlerInput.responseBuilder
      .speak('Please tell me the library name. You can also say \'list libraries\' to choose from the list of libraries we support. ')
      .reprompt('Please tell me the library name. You can also say \'list libraries\' to choose from the list of libraries we support.' )
      .withSimpleCard(SKILL_NAME, 'Please tell me the library name. You can also say \'list libraries\' to choose from the list of libraries we support.')
      .getResponse();
       
  },
};

const SessionEndedRequestHandler = {
  
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'SessionEndedRequest';
  },
  
  handle(handlerInput) {
    console.log(`Session ended with reason: ${handlerInput.requestEnvelope.request.reason}`);
    return handlerInput.responseBuilder.getResponse();
  },
};

const ErrorHandler = {
  
  canHandle() {
    return true;
  },
  
  handle(handlerInput, error) {
    console.log(`Error handled: ${error.message}`);

    return handlerInput.responseBuilder
      .speak('Sorry, an error must have occurred. Please ask any question... ')
      .withSimpleCard(SKILL_NAME, 'Sorry, an error must have occurred. Please ask any question... ')
      .reprompt('You can ask any question or say exit... ')
      .getResponse();
  },
};


// --------------------------------- CUSTOM HANDLERS ---------------------------------

//--------------------------------- Fetching hours for any library on a given date
const TimeSearchHandler = {
  
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return (request.type === 'IntentRequest' &&
      request.intent.name === 'TimeSearchIntent');
  },

  async handle(handlerInput) {

    const request = handlerInput.requestEnvelope.request;
    console.log('Time Search -Intent Received: %j', handlerInput.requestEnvelope.request.intent)
    var sessionAttributes =  handlerInput.attributesManager.getSessionAttributes()
    console.log('Session Attributes %j',sessionAttributes)
    //SLOT VALUE FOR SEARCHED QUERY
    sessionAttributes['type'] = 'libhours'
    handlerInput.attributesManager.setSessionAttributes(sessionAttributes);
    var query
    var date 
    if(request.intent.slots.libraryName != undefined){
     query = request.intent.slots.libraryName.value;
    }else if (sessionAttributes['libname']!='none'){
      query = sessionAttributes['libname']
    }
    if(request.intent.slots.dayDate != undefined){
      date = request.intent.slots.dayDate.value;
    }else if (sessionAttributes['dayDate']!='none'){
      date = sessionAttributes['dayDate']
    }
    sessionAttributes['dayDate'] = 'none'
    sessionAttributes['libname'] = 'none'
    sessionAttributes['stop_triggered'] = false
    handlerInput.attributesManager.setSessionAttributes(sessionAttributes);
    let newdate ='';
    if(date == undefined){
      newdate = getTodayDate();
    }
    else{
      newdate = date.toString();
    }
    
    console.log('query is -----------------' + query);
    console.log('date is -----------------' + newdate);

    
    let outputSpeech = '';
    let outputText = '';
    if(query == undefined){
      outputSpeech = 'We do not currently support this query.' + '<break time="2s"/>';
      outputText ='We do not currently support this query.' + '\n';
    }
    else{ 
      
      query = formatQuery(query);
       
    try {
     
     let libname=query;
     let displayname = query;
     
     //hard-coding variations -----------------------------
     switch(query){
       
        case 'a counting': 
        case 'counting':
        case 'accounting': displayname ='Accounting Library'; libname ='accounting'; break;
        
        case 'leavy':
        case 'leaving':
        case 'levy':
        case 'levi' :
        case 'leavi':
        case 'leavie':
        case 'levie':
        case 'levis':
        case 'leavey': displayname = 'Leavey Library'; libname = 'leavey'; break;
        
        case 'dohany':
        case 'do heany':
        case 'doheni' :
        case 'do heni':
        case 'do haney':
        case 'do heaney' :
        case 'do heani':
        case 'doheni':
        case 'dohaney':
        case 'doheaney' :
        case 'doheani':
        case 'duheani':
        case 'dohani' :
        case 'do hani':
        case 'do haeney':
        case 'do haaney' :
        case 'do haeni':
        case 'duhaney':
        case 'do heny':
        case 'dohany memorial':
        case 'do heany memorial':
        case 'doheni memorial' :
        case 'do heni memorial':
        case 'do haney memorial':
        case 'do heaney memorial' :
        case 'do heani memorial':
        case 'doheni memorial':
        case 'dohaney memorial':
        case 'doheaney memorial' :
        case 'doheani memorial':
        case 'duheani memorial':
        case 'dohani memorial' :
        case 'do hani memorial':
        case 'do haeney memorial':
        case 'do haaney memorial' :
        case 'do haeni memorial':
        case 'duhaney memorial':
        case 'do heny memorial':
        case 'tahini':
        case 'dohini':
        case 'dohney':
        case 'doheny': displayname='Doheny Memorial Library'; libname = 'doheny'; break;
        
        case 'dan':
        case 'dental':
        case 'dental library':
        case 'wilson dental': displayname ='Wilson Dental Library' ; libname = 'den'; break;
        
        case 'speckle':
        case 'special collections':
        case 'university archives':
        case 'spectral' : displayname = 'Special Collections Library'; libname = 'speccoll';break;
        
        case '1 hour kyf' :
        case ' 1 hour kai\'s ':
        case '1 hour kite': 
        case 'one archive': 
        case 'one archives':
        case 'one hour kaive': displayname = 'ONE Archives Library' ; libname = 'onearchive';break;
 
        case 'science':
        case 'science and engineering': displayname = 'Science and Engineering Library' ; libname = 'science';break;
        
        case 'grand':
        case 'grand depository': 
        case 'grand avenue': displayname = 'Grand Depository' ; libname = 'granddepos'; break;
        
        case 'norris':
        case 'norris medical':
        case 'medical':
        case 'med': displayname = 'Norris Medical Library' ; libname = 'med'; break;
          
        case 'gaughan and tiberti':
        case 'business': displayname = 'Gaughan and Tiberti Business Library' ; libname = 'business'; break;
            
        case 'philosophy':
        case 'who\'s':
        case 'hoose':
        case 'hoose library of philosophy': displayname= 'Hoose Library of Philosophy'; libname='philosophy';break;
        
        case 'vkc': displayname='VKC Library' ; libname = 'vkc';break;
        
        case 'cinema':
        case 'cinematic arts': displayname='Cinematic Arts Library'; libname = 'cinema'; break;
          
        case 'east':
        case 'east asian': displayname='East Asian Library';libname ='east'; break;
        
        case 'architecture and fine arts':
        case 'afa':
        case 'architecture': displayname ='Architecture and Fine Arts Library'; libname='afa'; break;
     }
     
     //----------------------------
     
      console.log(libname ,  newdate +"Z");
      
      const responses = await httpsGetTimes(libname, newdate +"Z" ,displayname);

      outputSpeech = 'Here are library hours for ' + displayname + ' for '+ newdate +'<break time = "1s"/> ';
      outputText = 'Here are library hours for ' + displayname + ' for '+ newdate +' \n';

      outputSpeech += 'From : ' + formatDate(responses.from) + ' till : ' + formatDate(responses.to) + '<break time="2s"/> ';
      outputText += 'From : ' + formatDate(responses.from) + '\n Till : ' + formatDate(responses.to) + '\n ';

    }
    
    catch (error) {
      console.log(error);
      
      outputSpeech = error + '<break time="2s"/>';
      outputText = error + '\n';
      
      console.log(`Intent: ${handlerInput.requestEnvelope.request.intent.name}: message: ${error.message}`);
    }
    }
    console.log(outputSpeech);
    console.log(outputText);
    //sessionAttributes['type'] = 'none'
    sessionAttributes['stop_triggered'] = false
    handlerInput.attributesManager.setSessionAttributes(sessionAttributes); 
    return handlerInput.responseBuilder
      .speak(outputSpeech + HELP_REPROMPT_2)
      .withSimpleCard(SKILL_NAME, outputText + "\n" +HELP_REPROMPT_2)
      .reprompt(outputText + "\n" +HELP_REPROMPT_2)
      .getResponse();

  },

};

//Opening times for any library on any date
const StartTimeHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return (request.type === 'IntentRequest' &&
      request.intent.name === 'StartTimeIntent');
  },

  async handle(handlerInput) {

    const request = handlerInput.requestEnvelope.request;

    //SLOT VALUE FOR SEARCHED QUERY
    var query = request.intent.slots.libraryName.value;
    var date = request.intent.slots.dayDate.value;
    let newdate ='';
    if(date == undefined){
      newdate = getTodayDate();
    }
    else{
      newdate = date.toString();
    }
    
    console.log('query is -----------------' + query);
    console.log('date is -----------------' + newdate);

    
    let outputSpeech = '';
    let outputText = '';
    if(query == undefined){
      outputSpeech = 'We do not currently support this query.' + '<break time="2s"/>';
      outputText ='We do not currently support this query.' + '\n';
    }
    else{
      
         query = formatQuery(query);
      
    try {
     
     let libname=query;
     let displayname = query;
     //hard-coding variations -----------------------------
     switch(query){
       
        case 'a counting': 
        case 'counting':
        case 'accounting': displayname ='Accounting Library'; libname ='accounting'; break;
        
        case 'leavy':
        case 'leaving':
        case 'levy':
        case 'levi' :
        case 'leavi':
        case 'leavie':
        case 'levie':
        case 'levis':
        case 'leavey': displayname = 'Leavey Library'; libname = 'leavey'; break;
        
        case 'dohany':
        case 'do heany':
        case 'doheni' :
        case 'do heni':
        case 'do haney':
        case 'do heaney' :
        case 'do heani':
        case 'doheni':
        case 'dohaney':
        case 'doheaney' :
        case 'doheani':
        case 'duheani':
        case 'dohani' :
        case 'do hani':
        case 'do haeney':
        case 'do haaney' :
        case 'do haeni':
        case 'duhaney':
        case 'do heny':
        case 'dohany memorial':
        case 'do heany memorial':
        case 'doheni memorial' :
        case 'do heni memorial':
        case 'do haney memorial':
        case 'do heaney memorial' :
        case 'do heani memorial':
        case 'doheni memorial':
        case 'dohaney memorial':
        case 'doheaney memorial' :
        case 'doheani memorial':
        case 'duheani memorial':
        case 'dohani memorial' :
        case 'do hani memorial':
        case 'do haeney memorial':
        case 'do haaney memorial' :
        case 'do haeni memorial':
        case 'duhaney memorial':
        case 'do heny memorial':
        case 'tahini':
        case 'dohini':
        case 'dohney':
        case 'doheny': displayname='Doheny Memorial Library'; libname = 'doheny'; break;
        
        case 'dan':
        case 'dental':
        case 'dental library':
        case 'wilson dental': displayname ='Wilson Dental Library' ; libname = 'den'; break;
        
        case 'speckle':
        case 'special collections':
        case 'university archives':
        case 'spectral' : displayname = 'Special Collections Library'; libname = 'speccoll';break;
        
        case '1 hour kyf' :
        case ' 1 hour kai\'s ':
        case '1 hour kite': 
        case 'one archive': 
        case 'one archives':
        case 'one hour kaive': displayname = 'ONE Archives Library' ; libname = 'onearchive';break;
 
        case 'science':
        case 'science and engineering': displayname = 'Science and Engineering Library' ; libname = 'science';break;
        
        case 'grand':
        case 'grand depository': 
        case 'grand avenue': displayname = 'Grand Depository' ; libname = 'granddepos'; break;
        
        case 'norris':
        case 'norris medical':
        case 'medical':
        case 'med': displayname = 'Norris Medical Library' ; libname = 'med'; break;
          
        case 'gaughan and tiberti':
        case 'business': displayname = 'Gaughan and Tiberti Business Library' ; libname = 'business'; break;
            
        case 'philosophy':
        case 'who\'s':
        case 'hoose':
        case 'hoose library of philosophy': displayname= 'Hoose Library of Philosophy'; libname='philosophy';break;
        
        case 'vkc': displayname='VKC Library' ; libname = 'vkc';break;
        
        case 'cinema':
        case 'cinematic arts': displayname='Cinematic Arts Library'; libname = 'cinema'; break;
          
        case 'east':
        case 'east asian': displayname='East Asian Library';libname ='east'; break;
        
        case 'architecture and fine arts':
        case 'afa':
        case 'architecture': displayname ='Architecture and Fine Arts Library'; libname='afa'; break;
     }
     
     //----------------------------
     
      console.log(libname ,  newdate +"Z");
      
      const responses = await httpsGetTimes(libname, newdate +"Z" ,displayname);

      outputSpeech += displayname + ' will be opening at '+ formatDate(responses.from) + ' on ' + newdate + '.<break time="2s"/> ';
      outputText += displayname + ' will be opening at '+ formatDate(responses.from) + ' on '  + newdate +  '.\n ';

    }
    
    catch (error) {
      console.log(error);
      
      outputSpeech = error + '<break time="2s"/>';
      outputText = error + '\n';
      
      console.log(`Intent: ${handlerInput.requestEnvelope.request.intent.name}: message: ${error.message}`);
    }
    }
    console.log(outputSpeech);
    console.log(outputText);

    return handlerInput.responseBuilder
      .speak(outputSpeech + HELP_REPROMPT_2)
      .withSimpleCard(SKILL_NAME, outputText + "\n" + HELP_REPROMPT_2)
      .reprompt(outputText + "\n" + HELP_REPROMPT_2)
      .getResponse();

  },

};

//closing times for any library on any date
const EndTimeHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return (request.type === 'IntentRequest' &&
      request.intent.name === 'EndTimeIntent');
  },

  async handle(handlerInput) {

    const request = handlerInput.requestEnvelope.request;

    //SLOT VALUE FOR SEARCHED QUERY
    var query = request.intent.slots.libraryName.value;
    var date = request.intent.slots.dayDate.value;
    let newdate ='';
    if(date == undefined){
      newdate = getTodayDate();
    }
    else{
      newdate = date.toString();
    }
    
    console.log('query is -----------------' + query);
    console.log('date is -----------------' + newdate);

    
    let outputSpeech = '';
    let outputText = '';
    if(query == undefined){
      outputSpeech = 'We do not currently support this query.' + '<break time="2s"/>';
      outputText ='We do not currently support this query.' + '\n';
    }
    else{ 
          query = formatQuery(query);
      
    try {
     
     let libname=query;
     let displayname = query;
     //hard-coding variations -----------------------------
     switch(query){
       
        case 'a counting': 
        case 'counting':
        case 'accounting': displayname ='Accounting Library'; libname ='accounting'; break;
        
        case 'leavy':
        case 'leaving':
        case 'levy':
        case 'levi' :
        case 'leavi':
        case 'leavie':
        case 'levie':
        case 'levis':
        case 'leavey': displayname = 'Leavey Library'; libname = 'leavey'; break;
        
        case 'dohany':
        case 'do heany':
        case 'doheni' :
        case 'do heni':
        case 'do haney':
        case 'do heaney' :
        case 'do heani':
        case 'doheni':
        case 'dohaney':
        case 'doheaney' :
        case 'doheani':
        case 'duheani':
        case 'dohani' :
        case 'do hani':
        case 'do haeney':
        case 'do haaney' :
        case 'do haeni':
        case 'duhaney':
        case 'do heny':
        case 'dohany memorial':
        case 'do heany memorial':
        case 'doheni memorial' :
        case 'do heni memorial':
        case 'do haney memorial':
        case 'do heaney memorial' :
        case 'do heani memorial':
        case 'doheni memorial':
        case 'dohaney memorial':
        case 'doheaney memorial' :
        case 'doheani memorial':
        case 'duheani memorial':
        case 'dohani memorial' :
        case 'do hani memorial':
        case 'do haeney memorial':
        case 'do haaney memorial' :
        case 'do haeni memorial':
        case 'duhaney memorial':
        case 'do heny memorial':
        case 'tahini':
        case 'doheny': displayname='Doheny Memorial Library'; libname = 'doheny'; break;
        
        case 'dan':
        case 'dental':
        case 'dental library':
        case 'wilson dental': displayname ='Wilson Dental Library' ; libname = 'den'; break;
        
        case 'speckle':
        case 'special collections':
        case 'university archives':
        case 'spectral' : displayname = 'Special Collections Library'; libname = 'speccoll';break;
        
        case '1 hour kyf' :
        case ' 1 hour kai\'s ':
        case '1 hour kite': 
        case 'one archive': 
        case 'one archives':
        case 'one hour kaive': displayname = 'ONE Archives Library' ; libname = 'onearchive';break;
 
        case 'science':
        case 'science and engineering': displayname = 'Science and Engineering Library' ; libname = 'science';break;
        
        case 'grand':
        case 'grand depository': 
        case 'grand avenue': displayname = 'Grand Depository' ; libname = 'granddepos'; break;
        
        case 'norris':
        case 'norris medical':
        case 'medical':
        case 'med': displayname = 'Norris Medical Library' ; libname = 'med'; break;
          
        case 'gaughan and tiberti':
        case 'business': displayname = 'Gaughan and Tiberti Business Library' ; libname = 'business'; break;
            
        case 'philosophy':
        case 'who\'s':
        case 'hoose':
        case 'hoose library of philosophy': displayname= 'Hoose Library of Philosophy'; libname='philosophy';break;
        
        case 'vkc': displayname='VKC Library' ; libname = 'vkc';break;
        
        case 'cinema':
        case 'cinematic arts': displayname='Cinematic Arts Library'; libname = 'cinema'; break;
          
        case 'east':
        case 'east asian': displayname='East Asian Library';libname ='east'; break;
        
        case 'architecture and fine arts':
        case 'afa':
        case 'architecture': displayname ='Architecture and Fine Arts Library'; libname='afa'; break;
     }
     
     //----------------------------
     
      console.log(libname ,  newdate +"Z");
      
      const responses = await httpsGetTimes(libname, newdate +"Z" ,displayname);
      outputSpeech += displayname + ' will be closing at '+ formatDate(responses.to) + ' on ' + newdate + '.<break time="2s"/> ';
      outputText += displayname + ' will be closing at '+ formatDate(responses.to) + ' on ' + newdate +  '.\n ';

    }
    
    catch (error) {
      console.log(error);
      
      outputSpeech = error + '<break time="2s"/>';
      outputText = error + '\n';
      
      console.log(`Intent: ${handlerInput.requestEnvelope.request.intent.name}: message: ${error.message}`);
    }
    }
    console.log(outputSpeech);
    console.log(outputText);

    return handlerInput.responseBuilder
      .speak(outputSpeech + "\n" + HELP_REPROMPT_2)
      .withSimpleCard(SKILL_NAME, outputText + "\n" + HELP_REPROMPT_2)
      .reprompt(outputText + "\n" + HELP_REPROMPT_2)
      .getResponse();

  },

};

//all libraries currently open today
const OpenNowHandler = { 
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return (request.type === 'IntentRequest' &&
      request.intent.name === 'OpenNow');
  },

  async handle(handlerInput) {
    
    let outputSpeech = 'The following libraries are currently open: <break time = "1s"/>';
    let outputText = 'The following libraries are currently open:\n';
    
    var time = getTimeNow();
    var count=0;
    for(var i = 0 ; i < libnames.length; i++){
    try{
      
      const response = await httpsGetTimes(libnames[i],getTodayDate()+"Z",displaynames[i]);
      console.log(response);
      
      if(isOpen(response.from,response.to,time)){
        
        outputSpeech+=count+1+". " + displaynames[i]+' <break time="0.5s"/>';
        outputText+= count+1+". " +displaynames[i]+" library\n";
        
        count+=1;
      }
      
     }
    catch (error){
     // outputSpeech ='Error with data. Please try again later. <break time="1s"/>';
    //  outputText ='Error with data.Please try again later. \n';
    //  break;
    }
    
    }
    return handlerInput.responseBuilder
      .speak(outputSpeech + "<break time='1s'/>" +HELP_REPROMPT_2)
      .withSimpleCard(SKILL_NAME, outputText + "\n" )
      .reprompt(HELP_REPROMPT_1)
      .getResponse();

  },

};

//--------------------------------- Events Handler - Getting events happening at USC! ---------------------------------
const EventsSearchHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return (request.type === 'IntentRequest' &&
      request.intent.name === 'EventsSearchIntent');
  },

  async handle(handlerInput) {
    console.log('EventSearchHandler- Intent Received: %j', handlerInput.requestEnvelope.request.intent)
    var sessionAttributes =  handlerInput.attributesManager.getSessionAttributes()
    console.log('Session Attributes %j',sessionAttributes)
   
    const request = handlerInput.requestEnvelope.request;
    sessionAttributes['type'] = 'events'
    sessionAttributes['stop_triggered'] = false
    handlerInput.attributesManager.setSessionAttributes(sessionAttributes);
    //SLOT VALUE FOR SEARCHED QUERY
    var date = request.intent.slots.dayDate;
    let newdate ='';
    if(date == undefined){
      newdate = sessionAttributes['dayDate']
    }
    else{
      date = request.intent.slots.dayDate.value;
      newdate = date.toString()
    }
    
    console.log('date is -----------------' + newdate);

    let outputSpeech = '';
    let outputText = '';
   
 
    try {
    
      //date required or not?
      const responses = await httpsGetEvents( newdate +"Z" );
      //const date_loc_responses = await httpsGetEventsTimeLoc();
      
      console.log("Events responses -------------"+responses);
      //console.log("Events responses -------------"+date_loc_responses);
      console.log("Events links -------------"+global.event_links);

     
      outputSpeech = 'Here are the Library Events happening at USC on '+ newdate+'<break time = "1s"/> \n ';
      outputText = 'The Library Events happening at USC on '+ newdate+' \n';
      
      if(responses.length < 1) {
        outputSpeech = 'No events found on '+newdate+'\n';
        outputText = 'No events found on '+newdate+'\n';
      }
      for(var i = 0 ; i<responses.length; i++){
        var loc;
        try {
          if(responses[i])
            loc = await httpsGet(responses[i][1]);
          else
            loc = 'not specified';
        } catch (error) {
          console.log(error);
        }
        console.log("Events Search: Location %s",loc);
        outputSpeech += '\n'+ (i+1) + '. ' + format(responses[i][0])+'<break time="0.2s"/> Location is '+loc+'.\n';
        outputText += '\n'+ (i+1) + '. ' + format(responses[i][0])+'Location: '+loc+'.\n';
      }
    }
    
    catch (error) {
      console.log(error);
      
      outputSpeech = error + '<break time="2s"/>';
      outputText = error + '\n';
      
      console.log(`Intent: ${handlerInput.requestEnvelope.request.intent.name}: message: ${error.message}`);
    }
    
    console.log(outputSpeech);
    console.log(outputText);
    //sessionAttributes['type'] = 'none'
    sessionAttributes['stop_triggered'] = false
    handlerInput.attributesManager.setSessionAttributes(sessionAttributes); 
    return handlerInput.responseBuilder
      .speak(outputSpeech + '<break time="0.7s"/>' + SPEECH_HELP)
      .withSimpleCard(SKILL_NAME, outputText + '\n' + ' Would you like to look up library hours or search library events?')
      .reprompt(HELP_REPROMPT_1)
      .getResponse();

  },

};

//--------------------------------- Library Name Events Handler - Getting events happening at a Particular Library! ---------------------------------
//--------------------------------- HELPER METHODS ---------------------------------

function httpsGetTimes(query, datetime, displayname) {

  return new Promise(((resolve, reject) => {

    const url = 'https://api-na.hosted.exlibrisgroup.com/almaws/v1/conf/libraries/' + encodeURIComponent(query.toUpperCase()) +
      '/open-hours?from=today&format=json&apikey=' + API_KEY_2;

    console.log("API URL :----- " + url);

    // HTTPS GET CALL TO API
    https.get(url, (resp) => {

      //EMPTY VARIABLES
      let data = '';
      let jsondata = '';

      console.log("response code --------" + resp.statusCode);
      
      if (resp.statusCode !== 200) 
        reject( 'Sorry. I did not understand \n '+ '"' + query + ' " <break time="0.2s/>' );
      

      //RECIEVE CHUNK OF DATA
      resp.on('data', (chunk) => {
        data += chunk;
      });

      //AFTER RECIEVING ENTIRE DATA
      resp.on('end', () => {

        jsondata = JSON.parse(data);

       // console.log(jsondata);
        
        var isvalidquery = jsondata.day;
        
        if (isvalidquery) {
          var done =false;
          
          for (var i = 0 ; i<8 ;i++)
            if( isvalidquery[i].date === datetime){
              //console.log(isvalidquery[i].date);
              //console.log(datetime);
                done = true;
                if(isvalidquery[i].hour.length > 0)
                resolve(isvalidquery[i].hour[0]);
                else{
                 // var libname = query.charAt(0).toUpperCase() + query.slice(1);
                  reject(displayname + " will be closed for the day.");
                }
            }
          if(!done)
          reject( 'Sorry, I do not have information for that day. I only have information within a range of one week, starting from today .');
          
        }

        else {
          reject( 'Sorry,  I am unable to proceed as I do not understand what you are looking for' );
        }

        
      });

    }).on("error", (err) => {
      console.log("Error: " + err.message);
      reject( 'Sorry. No data found for:\n '+ '"' + query + '"' );
    });
  }));
}

async function httpsGetEvents(datetime) {

  return new Promise(((resolve, reject) => {
    var list = [];
    const url = 'https://libraries.usc.edu/events-json';

    // HTTPS GET CALL TO API
    https.get(url, (resp) => {
     
      
      //EMPTY VARIABLES
      let data = '';
      let jsondata = '';
      var date_len = datetime.length
      var d = new Date(datetime)
      console.log("HttpsGetEvents: date %s size: %d url: %s", datetime,date_len, url);
      console.log("response code: " + resp.statusCode);
      
      if (resp.statusCode !== 200) 
        reject( 'Sorry. No data found.');
      

      //RECIEVE CHUNK OF DATA
      resp.on('data', (chunk) => {
        data += chunk;
      });

      //AFTER RECIEVING ENTIRE DATA
      resp.on('end', () => {

        jsondata = JSON.parse(data);

        console.log("JSONDATA-----------------"+data);
        
        var isvalidquery = jsondata.nodes;
        
        if (isvalidquery) {
          
          for (var i = 0 ; i<isvalidquery.length ;i++)
            if( isvalidquery[i].node ){
              var start = isvalidquery[i].node['Start Date'].slice(0,10)
              var end = isvalidquery[i].node['End Date'].slice(0,10)
              var start_date =new Date(start.slice(0,date_len))
              var end_date= new Date(end.slice(0,date_len))
              var title = isvalidquery[i].node.Title;
              var link = isvalidquery[i].node.Link;
              if( start_date - d <=0 &&  end_date - d >= 0){
                global.event_links.push(link);
                list.push([title + ". Starts on "+ start +" and ends on "+ end+".",link]);
                //const resp = httpsGet(link)
                //console.log('Response from Link %s : %j', link, resp)
              }
            }
          resolve(list);
        }

        else {
          reject( 'Sorry. No data found.');
        }

        
      });

    }).on("error", (err) => {
      console.log("Error: " + err.message);
      reject( 'Sorry. No data found.');
    });
  }));
}

function httpsGet(url) {
  return new Promise(((resolve, reject) => {
    var list = [];
    https.get(url, (resp) => {
    var data, jsondata
    console.log("HTTPGet response code: " + resp.statusCode+ "URL:"+url);
    console.log("HTTPGet response %j", resp)  
      if (resp.statusCode !== 200) 
        reject( 'Sorry. No data found.');
      

      //RECIEVE CHUNK OF DATA
      resp.on('data', (chunk) => {
        data += chunk;
      });

      //AFTER RECIEVING ENTIRE DATA
      resp.on('end', () => {

         //console.log("HTTPGet JSONDATA %j",data);
         var res = getLocationAndTimings(data)
         resolve(res);
       });

    }).on("error", (err) => {
      console.log("Error: " + err.message);
      reject( 'Sorry. No data found from url'+url);
    });
  }));
}

function httpsGetEventsTimeLoc() {
  
  return new Promise(((resolve, reject) => {

    const url = 'https://lotus.usc.edu/cgi-bin/htmlParser.py';

    // HTTPS GET CALL TO API
    https.get(url, (resp) => {

      //EMPTY VARIABLES
      let data = '';
      let jsondata = '';

      console.log("Response code HTML--------" + resp.statusCode);
      
      if (resp.statusCode !== 200) 
        reject( 'Sorry. No data found.');
      

      //RECEIVE CHUNK OF DATA
      resp.on('data', (chunk) => {
        data += chunk;
      });
      
      //AFTER RECEIVING ENTIRE DATA
      resp.on('end', () => {
        console.log("Data found HTML --------------"+data);
      });
      
      
      resolve(data);

    }).on("error", (err) => {
      console.log("Error: " + err.message);
      reject( 'Sorry. No data found.');
    });
  }));
}

function resultOk(result) {
  return result.filter((element, index) => (result.indexOf(element) == index));
}

function format(line) {
  return line.replace(/&/g, ' and ');
}

function formatDate(date) {

  var hours = date.substring(0, date.indexOf(":"));
  var minutes = date.substring(date.indexOf(":") + 1);
  var daytime = "AM";
  if (hours >= 12) {
    hours -= 12;
    daytime = "PM";
  }
  if (hours == 0) {
    hours = 12;
  }
  var newtiming = hours + ":" + minutes + " " + daytime;
  console.log(newtiming);
  return newtiming;
}

function formatQuery(query){
  query = query.toLowerCase();
      if(query.search('library')!==-1){
       query =  query.substring(0,query.search('library')).trim();
      }
      
       console.log('formatted query is -----------------' + query);
       return query;
}

function getTodayDate(){
  var today = new Date();
    console.log(today);
  var dd = today.getDate();
  var mm = today.getMonth()+1; 
  var yyyy = today.getFullYear();
  if(dd<10) 
      dd='0'+dd;
  if(mm<10) 
      mm='0'+mm;
  today = yyyy+'-'+mm+'-'+dd;

  return today;
}

function getTimeNow(){
  var today = new Date();
    //console.log(today);
    
  //PST timezone
  var h = today.getHours() - 8;
  var m = today.getMinutes();
  var currtime =h+":"+m ;
  
  return currtime;
}

function isOpen(starttime, endtime,time){
 
  var h_start = Number(starttime.substring(0,starttime.indexOf(":")) );
  var m_start = Number(starttime.substring(starttime.indexOf(":") + 1)); 
  var h_end= Number(endtime.substring(0,endtime.indexOf(":")) );
  var m_end= Number(endtime.substring(endtime.indexOf(":") + 1));
  var h_now = Number(time.substring(0,time.indexOf(":"))) ;
  var m_now = Number(time.substring(time.indexOf(":") + 1)); 
  
  // console.log(h_now +" : "+ m_now);
  // console.log(h_start +" : "+ m_start);
  // console.log(h_end +" : "+ m_end);
  
  if(h_now < h_start || h_now > h_end )
    return false;
    
  if(h_now === h_start){
    if(m_now < m_start)
      return false;
  }

  if(h_now === h_end){
    if(m_now > m_end)
      return false;
  }
  
  return true;
  
}

function getLocationAndTimings(data){
   var index_l = data.indexOf("Location:")
   var res = []
   res[0] = 'none'
   if(index_l){
     var location = data.toString().substring(index_l+30)
     index_l = location.indexOf("\">")
     location = location.toString().substring((index_l+2), location.indexOf("</"))
     res[0] = location
   } 
   return res
  
}



exports.handler = skillBuilder
  .addRequestHandlers(
    StartFAQsHandler,
    TimeIntentHandler,
    LibraryHoursIntentHandler,
    LibraryNameIntentHandler,
    HelpHandler,
    ExitHandler,
    TimeSearchHandler,
    StartTimeHandler,
    EndTimeHandler,
    OpenNowHandler,
    EventsSearchHandler,
    ListLibrariesIntentHandler,
     //LibraryEventSearchIntent,
    SessionEndedRequestHandler
  )
  .addErrorHandlers(ErrorHandler)
  .lambda();
