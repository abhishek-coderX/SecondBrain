- lets start the project what we are building
- second brain like we can dump all the things media
- link files ideas and then we can see it find from past and 
- also we can add like notion template copy kar sakte and theme and
- ai search feature summar of the week and month recap 
- like we canm do a lot while making the project slowly

Bootstraping

Init typescript project
npm init -y
npx tsc --init
​
Change rootDir and outDir
"rootDir": "./src",
"outDir": "./dist"
​
Install dependencies for express
npm i express 

- What are delecration files 
- typescript mein require use mat karo import use karo because 
- require types ko ignore kar deta hai
- we need to install types alag se for the js files
- like for example jisne express likha hai usne pure js mein likhahai
- but i want to use in my typescript project so how will i use it 
- uske liye d.ts file chahiye 
- ye aga se likha hota hai agar typescipt mein nahi hai
- jab 

npm install @types/express and jiske liye bhi error aayega types install kar lo 


- connect the mongodb 
- create db.ts and then import it in index.ts and configure it
- now lets move to schema design create models 
- user model
- tag model 
- content model
- link model
- for exporting use export default as you are using import 

- this is basically a knowledge dump for user 
- then we can use embedding and user query based on knowledge and add llm
- read more about elastic search and vector embedding its simliar to pdf chat
- you upload the pdf and it can serch based on content and find the data 


- now lets create APIS


## API Endpoints

### Authentication
- **POST /signup**: Register a new user. user zod for validation
- **POST /login**: Log in and receive a JWT token (set as cookie).
- **POST /logout**: Log out and clear the JWT token.


- the compiler is looking in src for all the files and folder so i put everthing in src 