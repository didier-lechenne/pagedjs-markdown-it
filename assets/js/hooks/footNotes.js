/**
 * Script that 
 * - Gathers markdown-generated footnote calls.
 * - For each call, gathers the target footnote (at the end of the <main>):
 *   - Deletes the back reference to the note call.
 *   - Creates an inline <span class="footnote">.
 *   - Inserts the content of the note within the <span>.
 *   - Injects the <span> after the call.
 *   - Deletes the call.
 * Author: [Your Name]
 */

// Function to get all relevant blocks within an element
function getBlocks(element) {
    return element.querySelectorAll('div, p, blockquote, section, article, h1, h2, h3, h4, h5, h6, figure');
}

// Function to unwrap block-level children from an element
function unwrapBlockChildren(element) {
    const blocks = getBlocks(element);
    blocks.forEach(block => {
        block.insertAdjacentHTML("beforebegin", block.innerHTML);
        block.remove();
    });
    const remainingBlocks = getBlocks(element);
    if (remainingBlocks.length) {
        unwrapBlockChildren(element); // Recursive call if there are still blocks
    }
    return element;
}

// Custom handler for Paged.js
class MyHandler extends Paged.Handler {
    constructor(chunker, polisher, caller) {
        super(chunker, polisher, caller);
    }

    beforeParsed(content) {
        // Handle inline footnotes
        const footnoteCalls = content.querySelectorAll(".footnote-ref");
        footnoteCalls.forEach(call => {
            // Query note content
            const noteId = call.querySelector("a").getAttribute('href').slice(1); // Remove the leading '#'
            const note = content.querySelector(`#${noteId}`);
            
            if (note) {
                // Delete back reference
                const backRef = note.querySelector('.footnote-backref');
                if (backRef) {
                    backRef.parentElement.removeChild(backRef);
                }
                
                // Create inline note
                const inlineNote = document.createElement('span');
                inlineNote.className = "footnote";
                
                // Unwrap the content of the note
                const unwrappedNote = unwrapBlockChildren(note);
                inlineNote.innerHTML = unwrappedNote.innerHTML;
                
                // Inject the <span> after the call
                call.after(inlineNote);
                
                // Remove the call
                call.parentElement.removeChild(call);
            }
        });
    }

    afterParsed(content){
        // console.info("Plugin → footNotes");
      }
}

// Register the custom handler with Paged.js
Paged.registerHandlers(MyHandler);

export { MyHandler, getBlocks, unwrapBlockChildren }; // Export functions and class if needed
