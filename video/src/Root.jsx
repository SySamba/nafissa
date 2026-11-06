import React from 'react';
import { Composition } from 'remotion';
import { LaunchVideo } from './LaunchVideo';

export const RemotionRoot = () => (
  <>
    {/* Version classique 16:9 — YouTube, TV, présentations */}
    <Composition
      id="Lancement"
      component={LaunchVideo}
      durationInFrames={1800}
      fps={30}
      width={1920}
      height={1080}
    />
    {/* Version verticale 9:16 — statuts WhatsApp, stories, mobile */}
    <Composition
      id="LancementMobile"
      component={LaunchVideo}
      durationInFrames={1800}
      fps={30}
      width={1080}
      height={1920}
    />
  </>
);
