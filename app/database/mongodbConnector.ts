import mongoose from "mongoose";

export default async () => {
    let uri = `mongodb://`;
    if (process.env.MONGODB_USERNAME) {
        uri += process.env.MONGODB_USERNAME;
        if (process.env.MONGODB_PASSWORD) {
            uri += `:${process.env.MONGODB_PASSWORD}`;
        }
        uri += "@";
    }
    uri += `${process.env.MONGODB_HOST}:${process.env.MONGODB_PORT}/${process.env.MONGODB_DATABASE}`;

    try{
        await mongoose.connect(uri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useFindAndModify: true,
            useCreateIndex:true,
        });

        console.log('connected to mongodb...');
    }catch(error){
        console.log(error);
        process.exit(1);
    }
};
