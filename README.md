# Autonotes
Mobile application that allows students to record their classes and uses speech-to-text to allow them to get a transcript of their class.

Frontend: First, I used Figma to design the main components of the UI. I then built the interface using React Native. I used a couple of libraries such as Redux, React Redux and Redux Persist to move data around the different components of the front-end. I also used Expo libraries such as expo-av to record audio and expo-iap to implement In-App-Purchases.

Backend: I set up my server in a AWS EC2 instance with a Windows OS. I used PHP in that server to build my REST API that manages requests accross the different components of the backend. I used an AWS service called Transcribe to be able to do speech-to-text. For the database, I used for the first time a NoSQL DB (DynamoDB), where I store information related to the recordings and the user. I also used AWS S3 to store the audio recordings and the transcripts.


https://user-images.githubusercontent.com/39929454/152912651-d04cce92-d651-4a86-bad1-a1449e33558e.mp4



https://user-images.githubusercontent.com/39929454/152912655-f5fcdcf7-f134-4f79-8bff-06dfdc47f1aa.mp4

