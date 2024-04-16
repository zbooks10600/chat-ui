import { ChatbotUIContext } from "@/context/context";
import useHotkey from "@/lib/hooks/use-hotkey";
import { LLM_LIST } from "@/lib/models/llm/llm-list";
import { cn } from "@/lib/utils";
import { IconBolt, IconCirclePlus, IconPlayerStopFilled, IconSend } from "@tabler/icons-react";
import Image from "next/image";
import { FC, useContext, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Input } from "../ui/input";
import { TextareaAutosize } from "../ui/textarea-autosize";
import { ChatCommandInput } from "./chat-command-input";
import { ChatFilesDisplay } from "./chat-files-display";
import { useChatHandler } from "./chat-hooks/use-chat-handler";
import { useChatHistoryHandler } from "./chat-hooks/use-chat-history";
import { usePromptAndCommand } from "./chat-hooks/use-prompt-and-command";
import { useSelectFileHandler } from "./chat-hooks/use-select-file-handler";
import { Mic, Mic2, MicroscopeIcon, Volume2 } from "lucide-react";

import dotenv from 'dotenv';
dotenv.config({path: process.cwd() + '.env.local'});

import * as sdk from "microsoft-cognitiveservices-speech-sdk";



// IMPORTING SPEECH TO TEXT SDKs
import { SpeechRecognizer, SpeechConfig, AudioConfig } from "microsoft-cognitiveservices-speech-sdk";

//const AZURE_SPEECH_TO_TEXT_API_KEY = process.env.AZURE_SPEECH_TO_TEXT_API_KEY || '';
//const AZURE_SPEECH_TO_TEXT_REGION = process.env.AZURE_SPEECH_TO_TEXT_REGION || '';
const AZURE_SPEECH_TO_TEXT_API_KEY="dfe6fa7633244821b939e49277b86865"
const AZURE_SPEECH_TO_TEXT_REGION="eastus"

const speechConfig = SpeechConfig.fromSubscription(AZURE_SPEECH_TO_TEXT_API_KEY, AZURE_SPEECH_TO_TEXT_REGION);
const audioConfig = AudioConfig.fromDefaultMicrophoneInput();

const recognizer = new SpeechRecognizer(speechConfig, audioConfig);
// IMPORTING SPEECH TO TEXT SDKs



import axios from 'axios';
import https from 'https';

const instance = axios.create({
  baseURL: 'https://api.eleven-labs.com/v1/',
  headers: {
    'xi-api-key': process.env.SPEECH_TO_TEXT_API_KEY || '',
    'Voice-ID': process.env.SPEECH_TO_TEXT_VOICE_ID || '',
    'Content-Type': 'audio/wav'
  },
  // Add this line to bypass SSL certificate validation
  httpsAgent: new https.Agent({ rejectUnauthorized: false })
});

interface ChatInputProps {}

export const ChatInput: FC<ChatInputProps> = ({}) => {
  const { t } = useTranslation();

  useHotkey("l", () => {
    handleFocusChatInput();
  });

  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [transcript, setTranscript] = useState<string>(''); // State to store speech-to-text transcript

  const {
    isAssistantPickerOpen,
    focusAssistant,
    setFocusAssistant,
    userInput,
    chatMessages,
    isGenerating,
    selectedPreset,
    selectedAssistant,
    focusPrompt,
    setFocusPrompt,
    focusFile,
    focusTool,
    setFocusTool,
    isToolPickerOpen,
    isPromptPickerOpen,
    setIsPromptPickerOpen,
    isFilePickerOpen,
    setFocusFile,
    chatSettings,
    selectedTools,
    setSelectedTools,
    assistantImages
  } = useContext(ChatbotUIContext);

  const {
    chatInputRef,
    handleSendMessage,
    handleStopMessage,
    handleFocusChatInput
  } = useChatHandler();

  const { handleInputChange } = usePromptAndCommand();

  const { filesToAccept, handleSelectDeviceFile } = useSelectFileHandler();

  const {
    setNewMessageContentToNextUserMessage,
    setNewMessageContentToPreviousUserMessage
  } = useChatHistoryHandler();

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setTimeout(() => {
      handleFocusChatInput();
    }, 200); // FIX: hacky
  }, [selectedPreset, selectedAssistant]);

  const handleKeyDown = (event: React.KeyboardEvent) => {
    // Your existing handleKeyDown function...
  };

  const handlePaste = (event: React.ClipboardEvent) => {
    // Your existing handlePaste function...
  };


  async function startSpeechRecognition() {
    // toast.message("API Key: " + process.env.PUBLIC_NEXT_AZURE_SPEECH_TO_TEXT_API_KEY);
    // toast.message("API Key: " + process.cwd());
    // Clear previous transcript
    setTranscript('');
    
    let isAppending = false; // Flag to track if transcript is being appended
    
    recognizer.recognizing = (s, e) => {
      if (!isAppending) {
        toast.message(`RECOGNIZING: ${e.result.text}`);
        console.log(`RECOGNIZING: ${e.result.text}`);
        // setTranscript(prevTranscript => prevTranscript + e.result.text); // Append transcribed text to existing transcript
        isAppending = true; // Set flag to true to indicate transcript is being appended
      }

      setTranscript(prevTranscript => prevTranscript + e.result.text); // Append transcribed text to existing transcript
    };
  
    recognizer.recognized = (s, e) => {

      if (e.result.text) { // Check if text is defined
        setTranscript(e.result.text); // Set transcript to recognized text
        handleSendMessage(e.result.text, chatMessages, false); // Assuming handleSendMessage sends the message 
        setTranscript('');
      }
      isAppending = false; // Reset flag
      recognizer.stopContinuousRecognitionAsync();
    };
  
    recognizer.canceled = (s, e) => {
      toast.error(`CANCELED: Reason=${e.reason}`);
      console.error(`CANCELED: Reason=${e.reason}`);
      recognizer.stopContinuousRecognitionAsync();
    };
  
    recognizer.sessionStopped = (s, e) => {
      toast.message("\n    Session stopped event.");
      console.log("\n    Session stopped event.");
      recognizer.stopContinuousRecognitionAsync();
    };
  
    // Start speech recognition
    recognizer.startContinuousRecognitionAsync();
  
    // Event handler for end of speech detection
    recognizer.sessionStopped = (s, e) => {
      toast.message("\n    End of speech detected.");
      console.log("\n    End of speech detected.");
      stopSpeechRecognition();
    };
  }
  
  function stopSpeechRecognition() {
    recognizer.stopContinuousRecognitionAsync();
  }  
  
  
  return (
    <>
      <div className="flex flex-col flex-wrap justify-center gap-2">
        <ChatFilesDisplay />

        {selectedTools &&
          selectedTools.map((tool, index) => (
            <div
              key={index}
              className="flex justify-center"
              onClick={() =>
                setSelectedTools(
                  selectedTools.filter(
                    selectedTool => selectedTool.id !== tool.id
                  )
                )
              }
            >
              <div className="flex cursor-pointer items-center justify-center space-x-1 rounded-lg bg-purple-600 px-3 py-1 hover:opacity-50">
                <IconBolt size={20} />

                <div>{tool.name}</div>
              </div>
            </div>
          ))}

        {selectedAssistant && (
          <div className="border-primary mx-auto flex w-fit items-center space-x-2 rounded-lg border p-1.5">
            {selectedAssistant.image_path && (
              <Image
                className="rounded"
                src={
                  assistantImages.find(
                    img => img.path === selectedAssistant.image_path
                  )?.base64
                }
                width={28}
                height={28}
                alt={selectedAssistant.name}
              />
            )}

            <div className="text-sm font-bold">
              Talking to {selectedAssistant.name}
            </div>
          </div>
        )}
      </div>

      <div className="border-input relative mt-3 flex min-h-[60px] w-full items-center justify-center rounded-xl border-2">
        <div className="absolute bottom-[76px] left-0 max-h-[300px] w-full overflow-auto rounded-xl dark:border-none">
          <ChatCommandInput />
        </div>

        <>
          <Mic
            className="absolute bottom-[12px] right-5 mr-6 cursor-pointer p-1 hover:opacity-50"
            size={32}
            // onClick={fromStream} // Start listening when the volume icon is clicked
            // onClick={startListening} // Start listening when the volume icon is clicked
            onClick={startSpeechRecognition} // Start listening when the volume icon is clicked
          />

          <IconCirclePlus
            className="absolute bottom-[12px] left-3 cursor-pointer p-1 hover:opacity-50"
            size={32}
            onClick={() => fileInputRef.current?.click()}
          />
          
          {/* Hidden input to select files from device */}
          <Input
            ref={fileInputRef}
            className="hidden"
            type="file"
            onChange={e => {
              if (!e.target.files) return;
              handleSelectDeviceFile(e.target.files[0]);
            }}
            accept={filesToAccept}
          />
        </>

        <TextareaAutosize
          textareaRef={chatInputRef}
          className="ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring text-md flex w-full resize-none rounded-md border-none bg-transparent px-20 py-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
          placeholder={t(`Ask anything. Type @  /  #  !`)}
          onValueChange={handleInputChange}
          // value={transcript}
          value={userInput || transcript || ''}
          minRows={1}
          maxRows={18}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          onCompositionStart={() => setIsTyping(true)}
          onCompositionEnd={() => setIsTyping(false)}
        />
        
        {/* <TextareaAutosize
          textareaRef={chatInputRef}
          className="ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring text-md flex w-full resize-none rounded-md border-none bg-transparent px-20 py-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
          placeholder={t(
            // `Ask anything. Type "@" for assistants, "/" for prompts, "#" for files, and "!" for tools.`
            `Ask anything. Type @  /  #  !`
          )}
          onValueChange={handleInputChange}
          value={userInput}
          minRows={1}
          maxRows={18}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          onCompositionStart={() => setIsTyping(true)}
          onCompositionEnd={() => setIsTyping(false)}
        /> */}

        <div className="absolute bottom-[14px] right-3 cursor-pointer hover:opacity-50">
          {isGenerating ? (
            <IconPlayerStopFilled
              className="hover:bg-background animate-pulse rounded bg-transparent p-1"
              onClick={handleStopMessage}
              size={30}
            />
          ) : (
            <IconSend
              className={cn(
                "bg-primary text-secondary rounded p-1",
                !userInput && "cursor-not-allowed opacity-50"
              )}
              onClick={() => {
                if (!userInput) return;

                handleSendMessage(userInput, chatMessages, false);
              }}
              size={30}
            />
          )}
        </div>
      </div>

      {transcript && (
        <div className="mt-3 text-sm text-gray-500">{transcript}</div>
      )}
    </>
  );
};

export default ChatInput;
