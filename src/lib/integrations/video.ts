/**
 * Video-room seam. Phase 1 returns the in-app simulated consult route
 * (`CallStage` keeps its fake behaviour). Phase 2 swaps in Daily.co / Twilio
 * and returns a real room URL that `CallStage` embeds.
 */
export interface VideoRoom {
  createRoom(appointmentId: string): Promise<{ url: string }>;
}

export const fakeVideoRoom: VideoRoom = {
  async createRoom(appointmentId) {
    return { url: `/consult/${appointmentId}` };
  },
};

export const videoRoom: VideoRoom = fakeVideoRoom;
