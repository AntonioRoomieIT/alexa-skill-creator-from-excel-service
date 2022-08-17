const { read } = require('sheetjs-style');
const aws = require('aws-sdk');
const s3 = new aws.S3();
const fs = require('fs');

exports.handler = async (event) => {
  const bucketName = 'parse-excel-to-json-mode-serverlessdeploymentbuck-1flg0sdr6936l';
  const fileKey = 'excel-versions/content.xlsx';
  let file = await s3.getObject({ Bucket: bucketName, Key: fileKey }).promise();
  const wb = read(file.Body);
  var modelAlexaJSON = {
    interactionModel: {
      languageModel: {
        invocationName: "funcion publica",
        intents: [
        ],
        types: [
        ]
      },
      dialog: {

      },
      prompts: {

      }
    }
  };


  hanlderOfSystemIntents(wb.Sheets.INTENTS_SYSTEM, modelAlexaJSON);
  hanlderOfIntents(wb.Sheets.INTENTS, modelAlexaJSON);
  handlerSlostList(wb.Sheets.SLOTS_LIST, modelAlexaJSON);
  handlerSlostPerIntent(wb.Sheets.SLOTS_OF_INTENTS, modelAlexaJSON);
  hanlerOfDialog(wb.Sheets.SLOTS_OF_INTENTS, modelAlexaJSON);


  fs.writeFile('alexaModel.json', JSON.stringify(modelAlexaJSON), err => {
    if (err) {
      console.error(err);
    }
    console.log("exito");
  });
};

const hanlderOfIntents = (intents, modelAlexaJSON) => {
  var arrOfIntent = [];
  var intentPerIntent = {};
  for (let [key, value] of Object.entries(intents)) {
    // console.log(key, value);
    if (key.includes('A')) {
      if (key != 'A1') {
        //NOMBRE DE INTENT
        intentPerIntent = {};
        //NOMBRE DE INTENT
        //console.log(cleanTH(value.r));
        intentPerIntent.name = cleanTH(value.r);
      }
    }
    if (key.includes('B')) {
      if (key != 'B1') {
        //FRASES
        intentPerIntent.samples = parseToArrayFromExcelWithComas(value.r);
        arrOfIntent.push(intentPerIntent);
      }
    }
    if (key.includes('C')) {
      if (key != 'C1') {
        //NECESITA CONFIRMACION?
        //console.log(cleanTH(value.r));
      }
    }
    if (key.includes('D')) {
      if (key != 'D1') {
        //PROMPTS
        //console.log(cleanTH(value.r));
      }
    }
  }
  modelAlexaJSON.interactionModel.languageModel.intents = modelAlexaJSON.interactionModel.languageModel.intents.concat(arrOfIntent);
}
const hanlderOfSystemIntents = (intents, modelAlexaJSON) => {
  var arrOfIntentSystem = [];
  var intentPerIntentSys = {};
  for (let [key, value] of Object.entries(intents)) {
    if (key.includes('A')) {
      if (key != 'A1') {
        intentPerIntentSys = {};
        //NOMBRE DE INTENT
        intentPerIntentSys.name = cleanTH(value.r);
      }
    }
    if (key.includes('B')) {
      if (key != 'B1') {
        //FRASES
        intentPerIntentSys.samples = parseToArrayFromExcelWithComas(value.r);
        arrOfIntentSystem.push(intentPerIntentSys);
      }
    }
  }
  modelAlexaJSON.interactionModel.languageModel.intents = arrOfIntentSystem;
}
const handlerSlostList = (slots, modelAlexaJSON) => {
  var arrOfSlots = [];
  var slotPerSlor = {};
  for (let [key, value] of Object.entries(slots)) {
    if (key.includes('A')) {
      if (key != 'A1') {
        //NOMBRE DE SLOTS
        slotPerSlor = {};
        slotPerSlor.name = cleanTH(value.r);
      }
    }
    if (key.includes('B')) {
      if (key != 'B1') {
        //vALORES DE SLOTS
        var slotsName = parseToArrayFromExcelWithComas(value.r);
        var arrayOfValueSlot = [];
        for (let x = 0; x < slotsName.length; x++) {
          var namePerName = {};
          var valuesTypes = {};
          namePerName.value = slotsName[x];
          valuesTypes.name = namePerName;
          arrayOfValueSlot.push(valuesTypes);
        }
        slotPerSlor.values = arrayOfValueSlot;
      }
    }
    if (key.includes('C')) {
      if (key != 'C1') {
        //SINONIMOS
        var synonyms = parseToArrayFromExcelWithComas(value.r);
        for (let x = 0; x < synonyms.length; x++) {
          var synonymsPerValue = synonyms[x].split('-');
          var valuesOfslots = slotPerSlor.values;
          valuesOfslots[x]['name']['synonyms'] = synonymsPerValue;
        }
      }
    }
    if (key.includes('D')) {
      if (key != 'D1') {
        //IS SYSTEM SLOT?
        if (cleanTH(value.r) === 'false') {
          arrOfSlots.push(slotPerSlor);
        }
      }
    }
  }
  modelAlexaJSON.interactionModel.languageModel.types = arrOfSlots;
}
const handlerSlostPerIntent = (slotsOfIntents, modelAlexaJSON) => {
  var arrTheSlotsOfAnyIntent = [];
  var slotPerSlotOfIntent = {};
  var groupWithIntentName = {};
  var whatIsTheIntentName = '';
  for (let [key, value] of Object.entries(slotsOfIntents)) {
    if (key.includes('A')) {
      if (key != 'A1') {
        if (whatIsTheIntentName != cleanTH(value.r)) {
          whatIsTheIntentName = cleanTH(value.r);
          arrTheSlotsOfAnyIntent = [];
        }
        groupWithIntentName.intentName = whatIsTheIntentName;
      }
    }
    if (key.includes('B')) {
      if (key != 'B1') {
        //SLOT NAME
        slotPerSlotOfIntent = {};
        slotPerSlotOfIntent.name = cleanTH(value.r);
      }
    }
    if (key.includes('C')) {
      if (key != 'C1') {
        //SLOT TYPE
        slotPerSlotOfIntent.type = cleanTH(value.r);
      }
    }
    if (key.includes('F')) {
      if (key != 'F1') {
        //SLOT USER UTTERANCE
        slotPerSlotOfIntent.samples = [cleanTH(value.r)];
        arrTheSlotsOfAnyIntent.push(slotPerSlotOfIntent);
        groupWithIntentName.slots = arrTheSlotsOfAnyIntent;
        var intents = modelAlexaJSON.interactionModel.languageModel.intents;
        for (let index = 0; index < intents.length; index++) {
          if (intents[index].name === groupWithIntentName.intentName) {
            intents[index].slots = groupWithIntentName.slots;
          }
        }
      }
    }
  }
}
const hanlerOfDialog = (slotsOfIntents, modelAlexaJSON) => {


  for (let [key, value] of Object.entries(slotsOfIntents)) {
    console.log(key,value);
    if (key.includes('A')) {
      if (key != 'A1') {
      }
    }
  }
}
const cleanTH = (cell) => {
  var newCell = cell.replace('<t>', '');
  newCell = newCell.replace('</t>', '');
  return newCell;
}
const parseToArrayFromExcelWithComas = (text) => {
  text = cleanTH(text);
  text = text.slice(1, -1);
  return text.split(',');
}



