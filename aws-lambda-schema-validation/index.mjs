import Ajv from "ajv";
import addFormats from "ajv-formats";
import { GlueClient, GetSchemaCommand, GetSchemaVersionCommand } from "@aws-sdk/client-glue";

console.log('Loading function -----');
let schemaDefinition;

if (!schemaDefinition) {
    console.log('No schema definition, getting schema definition');
    schemaDefinition = await getSchemaFromSchemaRegistry();
    console.log('Got the schema definition: ' + JSON.stringify(schemaDefinition));

}
else {
    console.log('Already has schema definition');
}


async function getSchemaFromSchemaRegistry() {
    // const client = new GlueClient({ region: 'eu-west-3', accessKeyId: '', secretAccessKey: '' });
    const client = new GlueClient({ region: 'eu-west-3'});
    const schemaDefinitionInput = {
        SchemaId: {
            SchemaName: "bam-demo-schema",
            RegistryName: "bam-demo-schema",
        },
        SchemaVersionNumber: {
            LatestVersion: true
        },
    }
    const schemadefCommand = new GetSchemaVersionCommand(schemaDefinitionInput);
    const responseScemaDef = await client.send(schemadefCommand);
    console.log("Got the schema from the aws glue schema registry");
    const schema = JSON.parse(responseScemaDef.SchemaDefinition);
    return schema;

}

function validateSchema(schemaDefinition, schema) {
    const ajv = new Ajv();
    addFormats(ajv);

    const validate = ajv.compile(schemaDefinition);

    // const jsonData = {
    //     "timestamp": "2023-06-19T09:18:21.051Z",
    //     "message": "This is the log message!",
    //     "level": "info"
    // };

    const valid = validate(schema);

    if (!valid) {
        console.log(validate.errors);
        return false;
    } else {
        console.log('JSON data is valid');
        return true;
    }
}

export const handler = (event, context) => {
    console.log('Started lambda handler');
    //console.log(JSON.stringify(event, null, 2));
    event.Records.forEach(record => {
        console.log('Record: ' + JSON.stringify(record));
        // Kinesis data is base64 encoded so decode here
        try {
            const payload = JSON.parse(Buffer.from(record.kinesis.data, 'base64').toString('ascii'));
            console.log('Decoded payload:', payload);
            const isValidSchema = validateSchema(schemaDefinition,payload);
            if (isValidSchema) {
                console.log('Valid schema');
            } else {
                console.log('Invalid schema');
            }
    

        } catch (error) {
            console.log('Error in schema validation, not a json');
            console.log(error);
            console.log('Invalid schema');

        }
    });
};