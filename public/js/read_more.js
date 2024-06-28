let readMoreContent = document.querySelector(".read_more");
let readMoreButton = document.querySelector(".read-more");
let readLessButton = document.querySelector(".read-less");
let introduction = document.querySelector(".introduction");

readMoreButton.addEventListener("click", () => {
    introduction.style.display = "none";
    readMoreContent.style.display = "block";
    readMoreButton.style.display = "none";
    readLessButton.style.display = "inline-block";
});

readLessButton.addEventListener("click", () => {
    introduction.style.display = "inline-block";
    readMoreContent.style.display = "none";
    readMoreButton.style.display = "inline-block";
    readLessButton.style.display = "none";
});


document.addEventListener("DOMContentLoaded", function() {
    const maxLength = 200; // Maximum number of characters to show
    const descriptionElement = document.getElementById('description');
    let description = descriptionElement.textContent;
  
    if (description.length > maxLength) {
      description = description.substring(0, maxLength) + '...';
    }
  
    descriptionElement.textContent = description;
  });
  