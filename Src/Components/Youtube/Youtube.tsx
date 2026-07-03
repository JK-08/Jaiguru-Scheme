import React, { useRef, useCallback } from "react";
import { StyleSheet, View, Dimensions } from "react-native";
import YoutubePlayer from "react-native-youtube-iframe";

const { width } = Dimensions.get("window");

export default function MainPageWithYouTube() {
  const playerRef = useRef(null);

  const onReady = useCallback(() => {
    console.log("✅ Video is ready to play");
  }, []);

  return (
    <View style={styles.container}>
     <YoutubePlayer
  ref={playerRef}
  height={(width * 9) / 16}
  width={width}
  play={true}
  mute={false}
  videoId="jvAQN2XDekY"
  onReady={onReady}
  webViewProps={{
    allowsInlineMediaPlayback: true,
    mediaPlaybackRequiresUserAction: false,
  }}
/>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
});
