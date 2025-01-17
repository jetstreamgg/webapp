export interface SendMessageRequest {
  api_key: string;
  chatbot_id: string;
  history: ChatHistory[];
  message: string;
  traceable: boolean;
}

export interface SendMessageResponse {
  message: string;
  response: string;
  suggestions?: string[];
  intents?: ChatIntent[];
}

export interface ChatHistory {
  id: string;
  user: UserType;
  message: string;
  type?: MessageType;
  // TODO remove, temp until API is updated
  role?: string;
  suggestions?: string[];
  intents?: ChatIntent[];
}

export interface ChatIntent {
  intent_description: string;
  url: string;
}

export interface Slot {
  description: string;
  field: string;
  slot_type: string;
  valid: boolean;
  raw_value?: string | null;
  parsed_value?: string | null;
  parse_error?: string | null;
  js_validator?: string | null;
  format?: string | null;
}

export type Recommendation = {
  metadata: {
    content: string;
  };
};
