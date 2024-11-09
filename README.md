# Real Time Transcription - Banker Assist

This repo contains a fully working web-based Real Time Transcription application, powered by Azure Speech to Text. You can deploy it to your Azure subscription and local PC in less than 20 minutes. You can then modify it for your specific needs.

## The Technology Used

You will be using: 

* **Azure Speech-to-Text**
* **React.js** with Javascript (with Bootstrap, to make things look good)
* **OpenAI** models for metadata extraction
* **Document Intelligence** for extracting the metadata from ID

## Architecture

The architecture is shown below:

## Getting Started


### Prerequisites

You need to have the following on your personal computer (PC, Mac or Linux):

* Visual Studio Code - you can install it from here: https://code.visualstudio.com/Download
* Docker Desktop - you can install it from here: https://docs.docker.com/desktop/
* Git - you can install it from here: https://git-scm.com/book/en/v2/Getting-Started-Installing-Git

### Installation

#### Azure Services

## Run Webapp

### Add your secrets

This only needs to be done once.

* Create the .env file. On your Visual Studio code terminal, enter

```
cd webapp 
cp env-template .env
```

* update the file, entering the credentials for your recently created Azure Cognitive Services:

```
REACT_APP_COG_SERVICE_KEY=<your congnitive service key>
REACT_APP_COG_SERVICE_LOCATION=<your cognitive service region>
```

### Run the app

* On the terminal enter:

```
cd webapp
yarn start
```

* click **start** and start speaking English. 

It will start transcribing what you say:

* Click **stop** to stop transcribing.

## Conclusion

This is the quick and simple way to build a working real-time-transcription webapp using React and javascript. This webapp recognizes English only, and simply transcribes what was said. It uses the standard model, so, some industry or subject specific words may be missed.

Next, you will learn how to recognize other languages, and how to improve accuracy by providing extra vocabulary.



