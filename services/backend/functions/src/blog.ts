import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

const db = admin.firestore();

// Function to generate URL-friendly slug from title
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "") // Remove special characters
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-") // Replace multiple hyphens with single
    .trim()
    .substring(0, 60); // Limit length
}

// Trigger when a blog post is created
export const onBlogPostCreate = functions.firestore
  .document("blog/{postId}")
  .onCreate(async (snap, context) => {
    const postData = snap.data();
    const postId = context.params.postId;

    try {
      // Generate slug if not provided
      if (!postData.slug && postData.title) {
        const baseSlug = generateSlug(postData.title);
        let slug = baseSlug;
        let counter = 1;

        // Check for slug uniqueness
        while (true) {
          const existingPost = await db
            .collection("blog")
            .where("slug", "==", slug)
            .where(admin.firestore.FieldPath.documentId(), "!=", postId)
            .limit(1)
            .get();

          if (existingPost.empty) {
            break;
          }

          slug = `${baseSlug}-${counter}`;
          counter++;
        }

        // Update the post with the generated slug
        await snap.ref.update({slug});
      }

      // Initialize counters
      await snap.ref.update({
        viewCount: 0,
        likeCount: 0,
        commentCount: 0,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      console.log(`Blog post ${postId} initialized successfully`);
    } catch (error) {
      console.error(`Error initializing blog post ${postId}:`, error);
    }
  });

// Trigger when a blog post is updated
export const onBlogPostUpdate = functions.firestore
  .document("blog/{postId}")
  .onUpdate(async (change, context) => {
    const beforeData = change.before.data();
    const afterData = change.after.data();
    const postId = context.params.postId;

    try {
      // Update the updatedAt timestamp if content changed
      const contentFields = ["title", "content", "excerpt", "tags", "category"];
      const contentChanged = contentFields.some(
        (field) => beforeData[field] !== afterData[field]
      );

      if (contentChanged) {
        await change.after.ref.update({
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      }

      // If published status changed to true, set publishedAt
      if (!beforeData.published && afterData.published) {
        await change.after.ref.update({
          publishedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      }

      console.log(`Blog post ${postId} updated successfully`);
    } catch (error) {
      console.error(`Error updating blog post ${postId}:`, error);
    }
  });

// Function to increment view count
export const incrementViewCount = functions.https.onCall(
  async (data, context) => {
    const {postId} = data;

    if (!postId) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "Post ID is required"
      );
    }

    try {
      const postRef = db.collection("blog").doc(postId);
      await postRef.update({
        viewCount: admin.firestore.FieldValue.increment(1),
      });

      return {success: true};
    } catch (error) {
      console.error("Error incrementing view count:", error);
      throw new functions.https.HttpsError(
        "internal",
        "Failed to increment view count"
      );
    }
  }
);

// Export all blog functions
export const blogFunctions = {
  onBlogPostCreate,
  onBlogPostUpdate,
  incrementViewCount,
};