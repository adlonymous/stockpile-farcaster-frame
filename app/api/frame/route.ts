import {
  FrameRequest,
  getFrameMessage,
  getFrameHtmlResponse,
} from "@coinbase/onchainkit";
import { NextRequest, NextResponse } from "next/server";
import { getDomainKeySync, NameRegistryState } from "@bonfida/spl-name-service";
import { Connection, PublicKey } from "@solana/web3.js";

export async function POST(req: NextRequest): Promise<Response> {
  let input: string | undefined = "";
  let recipientAddress = "";
  const NEXT_PUBLIC_URL = process.env.NEXT_PUBLIC_URL;
  let isEmail = false;
  const body: FrameRequest = await req.json();
  const env = process.env.CROSSMIT_ENV || "staging";

  try {
    const { message } = await getFrameMessage(body, {
      neynarApiKey: "NEYNAR_ONCHAIN_KIT",
    });

    if (message?.input) {
      input = message.input;
    }

    if (!input) {
      return new NextResponse(
        getFrameHtmlResponse({
          image: {
            src: `${NEXT_PUBLIC_URL}/error2.png`,
          },
          ogTitle: "Error",
        })
      );
    }

    if (input.slice(-4) === ".sol") {
      const { pubkey } = getDomainKeySync(input);
      const connection = new Connection("https://api.mainnet-beta.solana.com");
      const { registry } = await NameRegistryState.retrieve(connection, pubkey);

      const pubKey = new PublicKey(registry.owner);
      recipientAddress = pubKey.toBase58();
    } else if (input.includes("@")) {
      isEmail = true;
      recipientAddress = `email:${input}:solana`;
    } else {
      recipientAddress = `solana:${input}`;
    }

    const crossmintURL = `https://${env}.crossmint.com/api/2022-06-09/collections/${process.env.CROSSMINT_COLLECTION_ID}/nfts`;
    const crossmintOptions = {
      method: "POST",
      headers: {
        accept: "application/json",
        "content-type": "application/json",
        "x-api-key": process.env.CROSSMINT_API_KEY!,
      },
      body: JSON.stringify({
        recipient: recipientAddress,
        metadata: {
          name: "Stockpile Sticker",
          image: `${NEXT_PUBLIC_URL}/nft.png`,
          description: "A sticker from Stockpile Labs",
        },
      }),
    };

    return new NextResponse(
      getFrameHtmlResponse({
        image: {
          src: `${NEXT_PUBLIC_URL}/error.png`,
        },
        ogTitle: "Error",
      })
    );
  } catch (error) {
    return new NextResponse(
      getFrameHtmlResponse({
        image: {
          src: `${NEXT_PUBLIC_URL}/error.png`,
        },
        ogTitle: "Error",
      })
    );
  }
}

export const dynamic = "force-dynamic";
