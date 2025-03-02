from typing import List, Dict, Any
import time
import os
import uuid
from datetime import datetime
from openai import OpenAI
import requests
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Get API keys from environment variables
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
ELEVENLABS_API_KEY = os.getenv("ELEVENLABS_API_KEY")

# Conversation generator prompt
CONVERSATION_GENERATOR_PROMPT = """
<ROLE>You are a conversation generator bot. Generate a conversation between two crypto experts discussing the attached cryptocurrency news:</ROLE>

<HOSTS>The hosts will be Jamie and Rachel, two crypto experts. 
- They will introduce themselves, the SimpliFi podcast and a brief overview of the news.
- They will be light hearted, have banter and be engaging, while also being informative and educational.
- They should discuss the news, notable price movements, potential causes, and future predictions.
- They will not talk about NFTs or DeFi.
- They will end the conversation by thanking the listeners for listening and asking them to subscribe to the SimpliFi podcast.</HOSTS>

<CONVERSATION_LENGTH>The conversation should sound like a podcast that lasts about 2-3 minutes when spoken.</CONVERSATION_LENGTH>

<FORMAT>Format the dialogue as:

Jamie: [Jamie's statement]
Rachel: [Rachel's response]

And so on, alternating between speakers.
</FORMAT>
"""

def generate_conversation(news_article: str) -> str:
    """Generate a conversation between two people discussing the news using OpenAI's official client"""
    # Initialize the OpenAI client
    client = OpenAI(api_key=OPENAI_API_KEY)
    
    # Define system and user messages
    messages = [
        {"role": "system", "content": CONVERSATION_GENERATOR_PROMPT},
        {"role": "user", "content": f"Generate a conversation based on the following news article:{news_article}"}
    ]
    
    # Make the API call
    completion = client.chat.completions.create(
        model="gpt-4o",
        messages=messages,
        temperature=0.7,
    )
    
    # Extract and return the conversation
    return completion.choices[0].message.content

def convert_to_speech(conversation: str) -> bytes:
    """Convert the conversation to speech using ElevenLabs"""
    # Parse the conversation to separate speakers
    lines = conversation.strip().split("\n")
    dialogues = []
    
    for line in lines:
        if line.startswith("Jamie:"):
            speaker = "Jamie"
            text = line[7:].strip()
            dialogues.append({"speaker": speaker, "text": text})
        elif line.startswith("Rachel:"):
            speaker = "Rachel"
            text = line[8:].strip()
            dialogues.append({"speaker": speaker, "text": text})
    
    # Configure the ElevenLabs API
    headers = {
        "xi-api-key": ELEVENLABS_API_KEY,
        "Content-Type": "application/json"
    }
    
    # Voice IDs for different speakers
    voice_ids = {
        "Jamie": "XjLkpWUlnhS8i7gGz3lZ",  # First voice ID
        "Rachel": "21m00Tcm4TlvDq8ikWAM"   # Second voice ID (Rachel)
    }
    
    # Concatenate all audio files
    audio_segments = []
    
    for dialogue in dialogues:
        speaker = dialogue["speaker"]
        text = dialogue["text"]
        
        # Get the voice ID
        voice_id = voice_ids.get(speaker)
        
        # Add a small pause between speakers
        if len(audio_segments) > 0:
            time.sleep(0.5)  # Small delay between API calls
        
        # Make the API call to ElevenLabs
        payload = {
            "text": text,
            "model_id": "eleven_monolingual_v1",
            "voice_settings": {
                "stability": 0.5,
                "similarity_boost": 0.5
            }
        }
        
        url = f"https://api.elevenlabs.io/v1/text-to-speech/{voice_id}"
        response = requests.post(url, headers=headers, json=payload)
        
        if response.status_code == 200:
            audio_segments.append(response.content)
        else:
            raise Exception(f"ElevenLabs API Error: {response.status_code}, {response.text}")
    
    # Return the combined audio
    return b''.join(audio_segments)

async def generate_podcast(
    coin_ids: List[str], 
    duration_minutes: int = 5,
    voice_type: str = "neutral",
    include_price_analysis: bool = True
) -> Dict[str, Any]:
    """
    Generate a podcast about the specified cryptocurrencies
    
    This implementation:
    1. Generates a news article about the specified cryptocurrencies
    2. Creates a conversation between two hosts
    3. Converts the conversation to speech using ElevenLabs
    4. Stores the audio file and returns metadata
    """
    # Unique identifier for this podcast
    podcast_id = str(uuid.uuid4())
    
    # Current timestamp
    timestamp = datetime.now().isoformat()
    
    # Get the names of the coins from their IDs (in real implementation, you'd fetch from API)
    coin_names = {
        "bitcoin": "Bitcoin",
        "ethereum": "Ethereum",
        "solana": "Solana",
        "cardano": "Cardano",
        "binancecoin": "BNB",
        "ripple": "XRP",
        "polkadot": "Polkadot",
        "dogecoin": "Dogecoin",
        "avalanche-2": "Avalanche"
    }
    
    # Get the actual names or use IDs if not found
    coins_covered = [coin_names.get(coin_id.lower(), coin_id) for coin_id in coin_ids]
    
    # For the demo, we'll use a hardcoded news article
    # In a real implementation, you would generate this dynamically based on the coins
    news_article = f"""
    {', '.join(coins_covered)} Price Update and Market Analysis
    
    Bitcoin has surged above $60,000 for the first time in two weeks, as market sentiment improves following positive regulatory developments. The largest cryptocurrency by market capitalization is up 5.3% in the past 24 hours, currently trading at $61,250.
    
    Ethereum has also seen significant gains, rising 4.2% to reach $3,850. This comes after a successful network upgrade that reduced gas fees by approximately 30%.
    
    Meanwhile, Solana continues its impressive run, up 8.7% to $220, fueled by growing adoption in the NFT marketplace and several new DeFi projects launching on its blockchain.
    
    The recent market uptrend coincides with statements from the SEC chairperson suggesting a more collaborative approach to cryptocurrency regulation. Additionally, a Fortune 500 company announced yesterday that it has added Bitcoin to its treasury reserves, purchasing approximately $400 million worth of the digital asset.
    
    Market analysts point to improving institutional adoption and technological advancements as key drivers for the current bull run, though some caution that volatility may increase in the coming weeks as derivative contracts expire.
    """
    
    # Generate a conversation between two hosts
    conversation = generate_conversation(news_article)
    
    # Save the conversation to a file in the static directory
    static_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "static", "podcasts")
    os.makedirs(static_dir, exist_ok=True)
    conversation_path = os.path.join(static_dir, f"{podcast_id}.txt")
    with open(conversation_path, "w") as f:
        f.write(conversation)
    
    # Convert the conversation to speech
    audio_data = convert_to_speech(conversation)
    
    # Save the audio to a file
    audio_filename = f"{podcast_id}.mp3"
    audio_path = os.path.join(static_dir, audio_filename)
    with open(audio_path, "wb") as f:
        f.write(audio_data)
    
    # Generate the URL for the audio file
    audio_url = f"/podcasts/download/{podcast_id}"
    
    # Extract a small part of the conversation as a transcript excerpt
    lines = conversation.strip().split("\n")
    transcript_excerpt = "\n".join(lines[:4]) if len(lines) >= 4 else conversation
    
    # Get the actual duration of the podcast
    # For simplicity, we'll use the requested duration
    actual_duration_seconds = duration_minutes * 60
    
    # Generate a title based on the coins
    if len(coins_covered) == 1:
        title = f"{coins_covered[0]} Market Analysis"
    else:
        title = f"Crypto Market Roundup: {', '.join(coins_covered[:2])}" + (f" and {len(coins_covered)-2} more" if len(coins_covered) > 2 else "")
    
    return {
        "podcast_id": podcast_id,
        "title": title,
        "audio_url": audio_url,
        "audio_path": os.path.join("static", "podcasts", audio_filename),  # Internal path, not exposed to client
        "coins_covered": coins_covered,
        "duration_seconds": actual_duration_seconds,
        "transcript_excerpt": transcript_excerpt,
        "voice_type": voice_type,
        "created_at": timestamp,
        "expires_at": None  # In a real implementation, you might set an expiry time
    } 