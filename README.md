## To start the `Sentiment Analysis Application` run the Backend Application first and then the Frontend Application

## Steps to Start Backend (Flask) Application in Local:

### Note: Make sure you are doing all this Steps outside 'backend' directory

- Step-1: Install and Create Virtual Environment 
    - `pip install virtualenv`
    - `python -m venv venv`

- Step-2: Start venv and Install Dependencies
    - `venv\Scripts\activate`
    - `pip install -r requirements.txt`

- Step-4: Add AWS Access Key and Secret Key in .env File

- Step-3: Run 'server.py'
    - `python backend\src\server.py`

## Steps to Start Frontend (ReactJS) Application in Local:

### Note: Make sure you are doing all the steps **inside** 'sentiment' directory

- Step-1: Install npm 
    - `npm install`

- Step-2: Install amplify cli
    - `npm install -g @aws-amplify/cli`

- Step-3: Setup amplify
    - `amplify init`
    - Note: It is recommended to run this command from the root of your app directory
    - ? Enter a name for the environment `dev`
    - Using default provider  awscloudformation
    - ? Select the authentication method you want to use: `AWS access keys`
    - ? accessKeyId:  `Your Access Key`
    - ? secretAccessKey:  `Your Secret Access Key`
    - ? region:  `us-east-1`


- Step-4: Run application
    - `npm start`
