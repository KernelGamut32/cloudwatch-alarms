import { awscdk } from 'projen';
const project = new awscdk.AwsCdkTypeScriptApp({
  cdkVersion: '2.1.0',
  defaultReleaseBranch: 'main',
  name: 'cloudwatch-alarms',
  projenrcTs: true,

  deps: ["uuid"],             /* Runtime dependencies of this module. */
  // description: undefined,  /* The description is just a string that helps people understand the purpose of the package. */
  devDeps: ["@types/uuid"],          /* Build dependencies for this module. */
  // packageName: undefined,  /* The "name" in package.json. */

  context: {
    emailAddress: 'acgtestuser1@hotmail.com',
  }
});
project.synth();