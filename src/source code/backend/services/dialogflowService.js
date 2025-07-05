// File: backend/services/dialogflowService.js
const dialogflow = require('@google-cloud/dialogflow');
const { v4: uuidv4 } = require('uuid');

class DialogflowService {
    constructor() {
        this.projectId = process.env.DIALOGFLOW_PROJECT_ID;
        this.languageCode = process.env.DIALOGFLOW_LANGUAGE_CODE || 'vi';

        // Validate required environment variables
        if (!this.projectId) {
            console.error('❌ DIALOGFLOW_PROJECT_ID is not set in environment variables');
            throw new Error('DIALOGFLOW_PROJECT_ID is required');
        }

        if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
            console.error('❌ GOOGLE_APPLICATION_CREDENTIALS is not set in environment variables');
            throw new Error('GOOGLE_APPLICATION_CREDENTIALS is required');
        }

        console.log(`✅ Dialogflow initialized with project: ${this.projectId}`);

        // Initialize clients
        try {
            this.sessionsClient = new dialogflow.SessionsClient({
                keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS
            });

            this.intentsClient = new dialogflow.IntentsClient({
                keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS
            });

            this.agentsClient = new dialogflow.AgentsClient({
                keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS
            });
        } catch (error) {
            console.error('❌ Error initializing Dialogflow clients:', error);
            throw error;
        }
    }

    /**
     * Detect intent từ text
     */
    async detectIntent(sessionId, queryText, contexts = []) {
        try {
            const sessionPath = this.sessionsClient.projectAgentSessionPath(
                this.projectId,
                sessionId
            );

            const request = {
                session: sessionPath,
                queryInput: {
                    text: {
                        text: queryText,
                        languageCode: this.languageCode,
                    },
                },
            };

            // Thêm contexts nếu có
            if (contexts.length > 0) {
                request.queryParams = {
                    contexts: contexts
                };
            }

            const [response] = await this.sessionsClient.detectIntent(request);

            return {
                success: true,
                data: {
                    queryText: response.queryResult.queryText,
                    intent: {
                        name: response.queryResult.intent?.name,
                        displayName: response.queryResult.intent?.displayName,
                        confidence: response.queryResult.intentDetectionConfidence
                    },
                    fulfillmentText: response.queryResult.fulfillmentText,
                    parameters: response.queryResult.parameters,
                    contexts: response.queryResult.outputContexts,
                    webhookPayload: response.queryResult.webhookPayload,
                    responseId: response.responseId
                }
            };
        } catch (error) {
            console.error('Error detecting intent:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Tạo intent mới
     */
    async createIntent(intentData) {
        try {
            // Validate projectId
            if (!this.projectId) {
                throw new Error('Project ID is not configured');
            }

            console.log(`Creating intent with project ID: ${this.projectId}`);
            const agentPath = this.intentsClient.projectAgentPath(this.projectId);

            // Chuẩn bị training phrases
            const trainingPhrases = intentData.trainingPhrases.map(phrase => ({
                parts: [{ text: phrase.text }],
                type: 'EXAMPLE'
            }));

            // Chuẩn bị messages
            const messages = intentData.responses.map(response => {
                if (response.type === 'text') {
                    return {
                        text: {
                            text: [response.text]
                        }
                    };
                }
                // Có thể thêm các loại message khác
                return { text: { text: [response.text] } };
            });

            const intent = {
                displayName: intentData.displayName,
                trainingPhrases: trainingPhrases,
                messages: messages,
                inputContextNames: intentData.inputContexts || [],
                outputContexts: intentData.outputContexts || [],
                events: intentData.events || []
            };

            // Thêm parameters nếu có
            if (intentData.parameters && intentData.parameters.length > 0) {
                intent.parameters = intentData.parameters.map(param => ({
                    displayName: param.name,
                    entityTypeDisplayName: param.entityType,
                    mandatory: param.required || false,
                    prompts: param.prompts || [],
                    defaultValue: param.defaultValue || ''
                }));
            }

            const request = {
                parent: agentPath,
                intent: intent,
                languageCode: this.languageCode
            };

            const [response] = await this.intentsClient.createIntent(request);

            return {
                success: true,
                data: {
                    intentId: response.name,
                    displayName: response.displayName
                }
            };
        } catch (error) {
            console.error('Error creating intent:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Cập nhật intent
     */
    async updateIntent(intentId, intentData) {
        try {
            // Lấy intent hiện tại
            const [currentIntent] = await this.intentsClient.getIntent({
                name: intentId,
                languageCode: this.languageCode
            });

            // Cập nhật training phrases
            if (intentData.trainingPhrases) {
                currentIntent.trainingPhrases = intentData.trainingPhrases.map(phrase => ({
                    parts: [{ text: phrase.text }],
                    type: 'EXAMPLE'
                }));
            }

            // Cập nhật messages
            if (intentData.responses) {
                currentIntent.messages = intentData.responses.map(response => {
                    if (response.type === 'text') {
                        return {
                            text: {
                                text: [response.text]
                            }
                        };
                    }
                    return { text: { text: [response.text] } };
                });
            }

            // Cập nhật các field khác
            if (intentData.displayName) {
                currentIntent.displayName = intentData.displayName;
            }

            const request = {
                intent: currentIntent,
                languageCode: this.languageCode
            };

            const [response] = await this.intentsClient.updateIntent(request);

            return {
                success: true,
                data: {
                    intentId: response.name,
                    displayName: response.displayName
                }
            };
        } catch (error) {
            console.error('Error updating intent:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Xóa intent
     */
    async deleteIntent(intentId) {
        try {
            await this.intentsClient.deleteIntent({
                name: intentId
            });

            return {
                success: true,
                message: 'Intent deleted successfully'
            };
        } catch (error) {
            console.error('Error deleting intent:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Lấy danh sách intents
     */
    async listIntents() {
        try {
            // Validate projectId
            if (!this.projectId) {
                throw new Error('Project ID is not configured');
            }

            const agentPath = this.intentsClient.projectAgentPath(this.projectId);

            const [intents] = await this.intentsClient.listIntents({
                parent: agentPath,
                languageCode: this.languageCode
            });

            return {
                success: true,
                data: intents.map(intent => ({
                    intentId: intent.name,
                    displayName: intent.displayName,
                    trainingPhrasesCount: intent.trainingPhrases?.length || 0,
                    messagesCount: intent.messages?.length || 0
                }))
            };
        } catch (error) {
            console.error('Error listing intents:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Train agent (retrain model)
     */
    async trainAgent() {
        try {
            // Validate projectId
            if (!this.projectId) {
                throw new Error('Project ID is not configured');
            }

            console.log(`Training agent with project ID: ${this.projectId}`);
            const agentPath = this.agentsClient.projectPath(this.projectId);

            const [operation] = await this.agentsClient.trainAgent({
                parent: agentPath
            });

            // Đợi training hoàn thành
            const [response] = await operation.promise();

            return {
                success: true,
                message: 'Agent training completed',
                data: response
            };
        } catch (error) {
            console.error('Error training agent:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Export agent
     */
    async exportAgent() {
        try {
            const agentPath = this.agentsClient.projectPath(this.projectId);

            const [operation] = await this.agentsClient.exportAgent({
                parent: agentPath
            });

            const [response] = await operation.promise();

            return {
                success: true,
                data: response
            };
        } catch (error) {
            console.error('Error exporting agent:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Import agent
     */
    async importAgent(agentContent) {
        try {
            const agentPath = this.agentsClient.projectPath(this.projectId);

            const [operation] = await this.agentsClient.importAgent({
                parent: agentPath,
                agentContent: agentContent
            });

            const [response] = await operation.promise();

            return {
                success: true,
                message: 'Agent imported successfully',
                data: response
            };
        } catch (error) {
            console.error('Error importing agent:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Tạo session ID mới
     */
    generateSessionId() {
        return uuidv4();
    }

    /**
     * Validate configuration
     */
    validateConfig() {
        const required = [
            'DIALOGFLOW_PROJECT_ID',
            'GOOGLE_APPLICATION_CREDENTIALS'
        ];

        const missing = required.filter(key => !process.env[key]);

        if (missing.length > 0) {
            throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
        }

        return true;
    }
}

// Export class thay vì instance để tránh lỗi khi import
module.exports = DialogflowService;

// Export instance để sử dụng
module.exports.instance = () => {
    if (!module.exports._instance) {
        module.exports._instance = new DialogflowService();
    }
    return module.exports._instance;
};
