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
  EmbeddedBookingCard,
  FileAttachmentMessage,
  ImageGallery,
  ImageMessage,
  LocationMessage,
  MediaPicker,
  VoiceNoteMessage,
  type EmbeddedBooking,
  type FileAttachment,
  type ImageAttachment,
  type LocationShare,
  type VoiceNote,
} from "./rich-media";
