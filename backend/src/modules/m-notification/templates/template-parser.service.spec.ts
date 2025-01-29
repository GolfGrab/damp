/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { JSONContent } from '@tiptap/core';
import { DeepMockProxy } from 'jest-mock-extended';
import { TemplatesParserService } from './template-parser.service';

describe('TemplatesParserService', () => {
  let templatesParserService: DeepMockProxy<TemplatesParserService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TemplatesParserService],
    }).compile();

    templatesParserService = module.get(TemplatesParserService);
  });

  describe('parseJSONToHTML', () => {
    it('should convert JSON to HTML correctly', () => {
      const json: JSONContent = {
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [{ type: 'text', text: 'Hello World' }],
          },
        ],
      };
      const html = templatesParserService.parseJSONToHTML(json);
      expect(html).toBe('<p>Hello World</p>');
    });
  });

  describe('parseJSONToText', () => {
    it('should convert JSON to plain text correctly', () => {
      const json: JSONContent = {
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [{ type: 'text', text: 'Hello World' }],
          },
        ],
      };
      const text = templatesParserService.parseJSONToText(json);
      expect(text).toBe('Hello World');
    });
  });

  describe('parseJSONToMarkdown', () => {
    it('should convert JSON to Markdown correctly', () => {
      const json: JSONContent = {
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [{ type: 'text', text: 'Hello World' }],
          },
        ],
      };
      const markdown = templatesParserService.parseJSONToMarkdown(json);
      expect(markdown).toBe('Hello World');
    });
  });

  describe('parseJSONToCompiledTemplates', () => {
    it('should convert JSON to all formats correctly', () => {
      const json: JSONContent = {
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [{ type: 'text', text: 'Hello World' }],
          },
        ],
      };
      const compiled =
        templatesParserService.parseJSONToCompiledTemplates(json);
      expect(compiled).toEqual({
        HTML: '<p>Hello World</p>',
        MARKDOWN: 'Hello World',
        TEXT: 'Hello World',
      });
    });
  });
});
