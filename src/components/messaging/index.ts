/**
 * Messaging Components - Complete Messaging System
 *
 * Components for building messaging interfaces:
 * - Conversation list and message threads
 * - Rich media support (images, voice, location, files)
 * - Embedded booking cards
 * - Media picker for composing
 *
 * Following Lia Design System.
 */

// Main messaging interface
export { MessagingInterface } from "./messaging-interface";

// Rich media components
export {
  type EmbeddedBooking,
  EmbeddedBookingCard,
  type FileAttachment,
  FileAttachmentMessage,
  type ImageAttachment,
  ImageGallery,
  ImageMessage,
  LocationMessage,
  type LocationShare,
  MediaPicker,
  type VoiceNote,
  VoiceNoteMessage,
} from "./rich-media";
