#!/usr/bin/env node
import { Command } from 'commander';
import fs from 'fs';
import path from 'path';

import { main } from '../build/index.js';

// Assuming the current file is located at /home/user/project/app.js
const dirname = path.join(new URL('.', import.meta.url).pathname);
const packageJson = JSON.parse(
  fs.readFileSync(path.join(dirname, '../package.json'), 'utf8'),
);
const program = new Command();
const runTypes = ['test', 'review', 'translate', 'create', 'modify'];

program
  .version(packageJson.version, '-v, --version', 'output the current version')
  .description('Generate code, unit tests or review your code by chatgpt 4')
  .argument('<runType>', `run type: ${runTypes.join(', ')}`)
  .option('-k, --api-key <key>', 'Set the OpenAI API key')
  .option(
    '-t, --openai-session-token <token>',
    "OpenAI session token, 2 step to get token, If you don't set this, will use OPENAI_API_KEY, will cause fee by api key",
  )
  .option(
    '-pu, --openai-proxy-url <url>',
    'Proxy URL to use for OpenAI API requests',
  )
  .option('-m, --model <model>', 'OpenAI model to use')
  .option('-p, --prompt <prompt>', 'OpenAI prompt to use')
  .option('-mt, --max-tokens <tokens>', 'OpenAI max tokens to use')
  .option(
    '-e, --file-extensions <extensions>',
    'File extensions to read, example: .ts,.tsx',
  )
  .option(
    '-r, --read-type <type>',
    'Read files from directory or git stage, example: dir or git',
  )
  .option(
    '-s, --read-git-status <name>',
    'Read files from git stage by status default: A,R,M',
  )
  .option(
    '-d, --read-dir-name <name>',
    'Root name of the directory to read files from, example: src',
  )
  .option(
    '-f, --test-file-type <type>',
    'Generate test file type, example: test or spec',
  )
  .option(
    '-n, --test-file-dir-name <name>',
    'Generate test file directory name, example: __tests__',
  )
  .option(
    '-w, --review-report-webhook <url>',
    'Webhook URL to send review report',
  )
  .option(
    '-trans, --translate <languages>',
    'Translate the code to other languages, example: zh,en',
  )
  .action((runType, options) => {
    if (!runTypes.includes(runType)) {
      // exit with error
      console.error(
        `Invalid run type: ${runType}, please use one of ${runTypes.join(',')}`,
      );
      process.exit(1);
    }

    const userOptions = {
      huskyGPTType: runType,
      reviewTyping: options.reviewTyping,
      ...(options.apiKey && { openAIKey: options.apiKey }),
      ...(options.model && { openAIModel: options.model }),
      ...(options.prompt && { openAIPrompt: options.prompt }),
      ...(options.maxTokens && { openAIMaxTokens: Number(options.maxTokens) }),
      ...(options.fileExtensions && {
        readFileExtensions: options.fileExtensions,
      }),
      ...(options.readType && { readType: options.readType }),
      ...(options.readGitStatus && { readGitStatus: options.readGitStatus }),
      ...(options.readDirName && { readFilesRootName: options.readDirName }),
      ...(options.testFileType && { testFileType: options.testFileType }),
      ...(options.testFileDirName && {
        testFileDirName: options.testFileDirName,
      }),
      ...(options.reviewReportWebhook && {
        reviewReportWebhook: options.reviewReportWebhook,
      }),
      ...(options.openAISessionToken && {
        openAISessionToken: options.openAISessionToken,
      }),
      ...(options.openAIProxyUrl && {
        openAIProxyUrl: options.openAIProxyUrl,
      }),
      ...(options.translate && {
        translate: options.translate,
      }),
    };

    main(userOptions);
  });

program.parse(process.argv);
