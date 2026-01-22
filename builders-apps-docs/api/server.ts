import express from 'express';
import cors from 'cors';
import { streamText, tool } from 'ai';
import { anthropic } from '@ai-sdk/anthropic';
import { z } from 'zod';
import { MOVEMENT_BUILDER_SYSTEM_PROMPT } from '../lib/ai-builder-prompt.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Tool definitions for generating mini app files
const tools = {
  generateMiniApp: tool({
    description: 'Generate a complete Next.js mini app with Movement SDK integration',
    parameters: z.object({
      appName: z.string().describe('Name of the mini app'),
      description: z.string().describe('Description of what the app does'),
      features: z.array(z.string()).describe('List of features to implement'),
      usesSmartContract: z.boolean().describe('Whether the app needs a custom Move smart contract'),
    }),
    execute: async ({ appName, description, features, usesSmartContract }) => {
      // Generate package.json
      const packageJson = {
        name: appName.toLowerCase().replace(/\s+/g, '-'),
        version: '0.1.0',
        private: true,
        scripts: {
          dev: 'next dev',
          build: 'next build',
          start: 'next start',
        },
        dependencies: {
          '@movement-labs/miniapp-sdk': '^0.2.0',
          next: '^14.0.0',
          react: '^18.2.0',
          'react-dom': '^18.2.0',
        },
        devDependencies: {
          '@types/node': '^20.0.0',
          '@types/react': '^18.2.0',
          typescript: '^5.0.0',
        },
      };

      // Generate manifest.json
      const manifest = {
        name: appName,
        short_name: appName.substring(0, 12),
        description: description,
        version: '1.0.0',
        start_url: '/',
        display: 'standalone',
        background_color: '#000000',
        theme_color: '#00D4AA',
        icons: [
          {
            src: '/icon.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
        permissions: {
          wallet: true,
          transactions: true,
          storage: true,
          camera: features.some((f) => f.toLowerCase().includes('camera')),
          location: features.some((f) => f.toLowerCase().includes('location')),
          biometric: features.some((f) => f.toLowerCase().includes('biometric')),
        },
      };

      return {
        success: true,
        appName,
        packageJson,
        manifest,
        usesSmartContract,
      };
    },
  }),

  generateReactComponent: tool({
    description: 'Generate a React component for the mini app',
    parameters: z.object({
      componentName: z.string().describe('Name of the component'),
      componentType: z
        .union([
          z.literal('page'),
          z.literal('feature'),
          z.literal('ui'),
          z.literal('layout'),
        ])
        .describe('Type of component'),
      functionality: z.string().describe('What the component does'),
      usesSdk: z.boolean().describe('Whether it uses Movement SDK'),
    }),
    execute: async ({ componentName, componentType, functionality, usesSdk }) => {
      return {
        success: true,
        componentName,
        componentType,
        functionality,
        usesSdk,
        note: 'Component code should be generated in the chat response',
      };
    },
  }),

  generateMoveContract: tool({
    description: 'Generate a Move smart contract for the mini app',
    parameters: z.object({
      moduleName: z.string().describe('Name of the Move module'),
      functionality: z.string().describe('What the contract does'),
      hasStorage: z.boolean().describe('Whether it needs storage/resources'),
      hasEvents: z.boolean().describe('Whether it emits events'),
    }),
    execute: async ({ moduleName, functionality, hasStorage, hasEvents }) => {
      return {
        success: true,
        moduleName,
        functionality,
        hasStorage,
        hasEvents,
        note: 'Move contract code should be generated in the chat response',
      };
    },
  }),

  generateTests: tool({
    description: 'Generate tests for the mini app or Move contract',
    parameters: z.object({
      testType: z
        .union([
          z.literal('unit'),
          z.literal('integration'),
          z.literal('move'),
        ])
        .describe('Type of tests'),
      targetFile: z.string().describe('File or module being tested'),
      testCases: z.array(z.string()).describe('List of test cases to cover'),
    }),
    execute: async ({ testType, targetFile, testCases }) => {
      return {
        success: true,
        testType,
        targetFile,
        testCases,
        note: 'Test code should be generated in the chat response',
      };
    },
  }),
};

// Chat endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { messages } = req.body;

    if (!process.env.ANTHROPIC_API_KEY) {
      return res.status(500).json({
        error: 'ANTHROPIC_API_KEY is not configured',
      });
    }

    const result = streamText({
      model: anthropic('claude-sonnet-4-20250514'),
      system: MOVEMENT_BUILDER_SYSTEM_PROMPT,
      messages,
      tools,
      temperature: 0.7,
    });

    // Set headers for streaming
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    // Stream the response
    for await (const chunk of result.textStream) {
      res.write(`data: ${JSON.stringify({ text: chunk })}\n\n`);
    }

    res.write('data: [DONE]\n\n');
    res.end();
  } catch (error) {
    console.error('Chat API error:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Internal server error',
    });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`🤖 AI Builder API running on http://localhost:${PORT}`);
  console.log(`📝 Chat endpoint: POST http://localhost:${PORT}/api/chat`);
});
