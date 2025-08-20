<template>
  <v-container fluid class="fill-height pa-0">
    <v-row no-gutters class="fill-height">
      <v-col cols="12" md="6" class="d-flex align-center justify-center bg-white pa-8">
        <v-card flat max-width="400px" width="100%">
          <router-view name="authForm" />
        </v-card>
      </v-col>

      <v-col cols="12" md="6" class="d-none d-md-flex align-center justify-center auth-background fill-height">
        </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
// No specific script needed for the layout component yet
</script>

<style scoped>
.auth-background {
  /* Recreating the abstract background from login.jpg using CSS */
  background-color: #e0f2f7; /* Light blue base */
  position: relative;
  overflow: hidden; /* Ensure shapes don't spill */
}

/* Example of creating the geometric shapes using pseudo-elements */
.auth-background::before,
.auth-background::after {
  content: '';
  position: absolute;
  border-radius: 50%; /* For circles/arcs */
}

.auth-background::before {
  /* Large light blue/teal circle/arc top-right */
  width: 500px;
  height: 500px;
  background-color: #a7ffeb; /* Light teal */
  top: -150px;
  right: -150px;
  transform: rotate(45deg); /* To create the quadrant effect */
  opacity: 0.7;
}

.auth-background::after {
  /* Larger light blue/teal circle/arc bottom-left */
  width: 600px;
  height: 600px;
  background-color: #80deea; /* Slightly darker teal/light blue */
  bottom: -200px;
  left: -200px;
  transform: rotate(-30deg);
  opacity: 0.6;
}

/* Add more pseudo-elements or background-image for other shapes if desired */
/* For instance, the orange and dark blue blocks/arcs would require more specific positioning and shapes */

/* The exact recreation of the login.jpg background might be complex with pure CSS.
   Consider using a single background image if the complexity is too high.
*/
</style>