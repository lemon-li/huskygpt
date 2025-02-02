import fs from 'fs';
import { userOptions } from 'src/constant';
import { HuskyGPTTypeEnum, IReadFileResult } from 'src/types';
import { ExtractCodePrompts } from 'src/utils/extract-code-prompts';
import { readPromptFile } from 'src/utils/read-prompt-file';

export class HuskyGPTPrompt {
  private huskyGPTTypeMap: Record<
    HuskyGPTTypeEnum,
    (fileResult: IReadFileResult) => string[]
  > = {
    [HuskyGPTTypeEnum.Test]: (fileResult) => {
      const fileContent =
        fileResult.fileContent ||
        fs.readFileSync(fileResult.filePath!, 'utf-8');
      const testsPrompt = readPromptFile('tests.txt');
      // const fileName = getFileNameByPath(fileResult.filePath!)
      // - Import the test function from "../${fileName}".
      const basePrompt = `
        ${testsPrompt}
        ${userOptions.options.openAIPrompt || ''}
      `;

      const codePicker = new ExtractCodePrompts();

      const codePrompts = codePicker.extractFunctionOrClassCodeArray({
        ...fileResult,
        fileContent,
      });

      return [basePrompt, ...codePrompts];
    },
    [HuskyGPTTypeEnum.Review]: (fileResult) => {
      const fileContent =
        fileResult.fileContent ||
        fs.readFileSync(fileResult.filePath!, 'utf-8');
      const reviewPrompt = readPromptFile('review.txt');
      const basePrompt = `
        ${reviewPrompt}
        ${userOptions.options.openAIPrompt || ''}
      `;

      const codePicker = new ExtractCodePrompts();

      const codePrompts = codePicker.extractFunctionOrClassCodeArray({
        ...fileResult,
        fileContent,
      });

      return [basePrompt, ...codePrompts];
    },
    [HuskyGPTTypeEnum.Create]: ({ prompts }) => {
      if (!prompts) throw new Error('prompts is required for create');
      const createPrompt = readPromptFile('create.txt');
      const basePrompt = `
      ${createPrompt}
      ${userOptions.options.openAIPrompt || ''}
    `;

      return [basePrompt, ...prompts];
    },
    [HuskyGPTTypeEnum.Translate]: (fileResult) => {
      const fileContent =
        fileResult.fileContent ||
        fs.readFileSync(fileResult.filePath!, 'utf-8');
      const readPrompt = readPromptFile('translate.txt');
      const basePrompt = `
        ${readPrompt}
        - Target language: ${userOptions.options.translate}
        ${userOptions.options.openAIPrompt || ''}
      `;

      return [basePrompt, fileContent];
    },
    [HuskyGPTTypeEnum.Modify]: (fileResult) => {
      const readPrompt = readPromptFile('modify.txt');
      const basePrompt = `
        ${readPrompt}
        ${userOptions.options.openAIPrompt || ''}
      `;

      return [basePrompt, ...fileResult.prompts];
    },
  };

  constructor(private huskyGPTType: HuskyGPTTypeEnum) {}

  public generatePrompt(fileResult: IReadFileResult): string[] {
    if (!fileResult)
      throw new Error('File path is required for generatePrompt');
    if (!this.huskyGPTTypeMap[this.huskyGPTType])
      throw new Error('Invalid huskyGPTType: ' + this.huskyGPTType);

    return this.huskyGPTTypeMap[this.huskyGPTType](fileResult);
  }
}
