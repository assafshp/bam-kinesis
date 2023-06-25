import Ajv from "ajv";
import addFormats from "ajv-formats";
import { GlueClient, GetSchemaCommand, GetSchemaVersionCommand } from "@aws-sdk/client-glue";

async function getSchemaFromSchemaRegistry() {
    const client = new GlueClient({ region: 'eu-west-3' });
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
    const valid = validate(schema);
    if (!valid) {
        console.log(validate.errors);
        console.log('JSON data is invalid');

        return false;
    } else {
        console.log('JSON data is valid');
        return true;
    }
}


async function main() {
    console.log('main started');
    const schemaDefinition = await getSchemaFromSchemaRegistry();
    console.log(JSON.stringify(schemaDefinition));

    // const jsonData = {
    //     "timestamp": "2023-06-25T13:26:22.285Z",
    //     "snakes": "delicious",
    //     "level": "info",
    //     "message": "This is the log message!"
    // };

    let tmp = 'eyJ0aW1lc3RhbXAiOiIyMDIzLTA2LTI1VDEzOjUyOjIwLjAxMVoiLCJzbmFrZXMiOiJkZWxpY2lvdXMiLCJsZXZlbCI6ImluZm8iLCJtZXNzYWdlIjoiVGhpcyBpcyB0aGUgbG9nIG1lc3NhZ2UhIn0=';
    let payload = JSON.parse(Buffer.from(tmp, 'base64').toString('ascii'));
    console.log(payload);

    const valid = validateSchema(schemaDefinition, payload);

    if (!valid) {
        console.log(validate.errors);
    }

};

main();


