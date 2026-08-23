export const mapService = {
  getEmbedUrl(location) {
    // Use the correct Google Maps Embed search URL format
    const encodedLocation = encodeURIComponent(location)
    return `https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d100000!2d0!3d0!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2z${encodedLocation}!5e0!3m2!1sen!2sus!4v1&w=600&h=400`
  },

  // Better approach: Use search-based embed
  getSearchEmbedUrl(query) {
    const encoded = encodeURIComponent(query)
    // This format uses Google Maps search which works better for locations
    return `https://maps.google.com/maps?q=${encoded}&t=&z=13&ie=UTF8&iwloc=&output=embed`
  }
}