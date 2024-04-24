class Chatbox {
    constructor() {
        this.args = {
            openButton: document.querySelector('.chatbox__button'),
            chatBox: document.querySelector('.chatbox__support'),
            sendButton: document.querySelector('.send__button'),
        }

        this.state = false;
        // Array to store messages exchanged in the chat
        this.messages = [];
        this.links = {}; // Object to store fetched links
    }
    // Method to display the chatbox and set up event listeners
    display() {
        const {openButton, chatBox, sendButton} = this.args;

        openButton.addEventListener('click', () => this.toggleState(chatBox))

        sendButton.addEventListener('click', () => this.onSendButton(chatBox))

        const node = chatBox.querySelector('input');
        node.addEventListener("keyup", ({key}) => {
            if (key === "Enter") {
                this.onSendButton(chatBox)
            }
        })
        // Handle button clicks within the chatbox
        const buttonContainer = chatBox.querySelector('.button-container');
        buttonContainer.addEventListener('click', (event) => {
            const clickedButton = event.target.closest('button');
            if (clickedButton) {
                const buttonText = clickedButton.textContent.trim();
                this.onButtonClick(buttonText, chatBox);
            }
        });

        // Fetch links when the Chatbox is initialized
        this.fetchLinks();
    }
    // Method to toggle the state of the chatbox 
    toggleState(chatbox) {
        this.state = !this.state;

        // show or hide the box
        if (this.state) {
            chatbox.classList.add('chatbox--active');
        } else {
            chatbox.classList.remove('chatbox--active');
        }
    }
    // Method to handle button clicks in the chatbox
    onButtonClick(question, chatbox) {
        let message = { name: "User", message: question };
        this.messages.push(message);
    
        fetch($SCRIPT_ROOT + '/predict', {
            method: 'POST',
            body: JSON.stringify({ message: question }), 
            mode: 'cors',
            headers: {
                'Content-Type': 'application/json'
            },
        })
        .then(response => response.json())
        .then(data => {
            let responseMessage = { name: "LAMAR", message: data.answer };
            this.messages.push(responseMessage);
    
            const buttonsContainer = chatbox.querySelector('.button-container');
            console.log('Buttons container:', buttonsContainer); 
            // Update the button options if there are next questions
            if (data.next_questions && data.next_questions.length > 0) {
                buttonsContainer.innerHTML = '';  // Clear existing buttons
    
                data.next_questions.forEach((nextQuestion, index) => {
                    const button = document.createElement('button');
                    button.textContent = nextQuestion;
                    button.id = 'button' + (index + 1); 
                    buttonsContainer.appendChild(button);
                });
            }
            
            this.updateChatText(chatbox);
        })
        .catch(error => {
            console.error('Error:', error);
            let errorMessage = { name: "LAMAR", message: "Sorry, an error occurred while fetching the response." };
            this.messages.push(errorMessage);
            this.updateChatText(chatbox);
        });
    }
    // Method to handle sending a message from the input field
    onSendButton(chatbox) {
        var textField = chatbox.querySelector('input');
        let text1 = textField.value
        if (text1 === "") {
            return;
        }
    
        let message_1 = { name: "User", message: text1 }
        this.messages.push(message_1);
    
        fetch($SCRIPT_ROOT + '/predict', {
            method: 'POST',
            body: JSON.stringify({ message: text1 }),
            mode: 'cors',
            headers: {
              'Content-Type': 'application/json'
            },
          })
          .then(r => r.json())
          .then(data => {
            let message_2 = { name: "LAMAR", message: data.answer };
            this.messages.push(message_2);
    
            const buttonsContainer = chatbox.querySelector('.button-container');
            console.log('Buttons container:', buttonsContainer); 
    
            if (data.next_questions && data.next_questions.length > 0) {
                buttonsContainer.innerHTML = '';  // Clear existing buttons
    
                data.next_questions.forEach((nextQuestion, index) => {
                    const button = document.createElement('button');
                    button.textContent = nextQuestion;
                    button.id = 'button' + (index + 1); 
                    buttonsContainer.appendChild(button);
                });
            }
            
            this.updateChatText(chatbox)
            textField.value = ''
    
        }).catch((error) => {
            console.error('Error:', error);
            this.updateChatText(chatbox)
            textField.value = ''
            
          });
    }
    
    
    // Fetch links from links.html
    fetchLinks() {
        fetch('/links')
            .then(response => response.text())
            .then(data => {
                // Parse the links content to extract links and store them in the links object
                const parser = new DOMParser();
                const linksDoc = parser.parseFromString(data, 'text/html');
                linksDoc.querySelectorAll('div[data-link]').forEach(link => {
                    this.links[link.id] = link.dataset.link;
                });
            })
            .catch(error => console.error('Error fetching links:', error));
    }

    // Function to replace placeholders with actual links in messages
    replaceLinkPlaceholders(response) {
        return response.replace(/<a href='#' data-link-id='(.*?)'>.*?<\/a>/g, (match, linkId) => {
            return `<a href="${this.links[linkId]}">Link</a>`;
        });
    }
     // Method to update the chatbox with the current messages
    updateChatText(chatbox) {
        var html = '';
        this.messages.slice().reverse().forEach(item => {
            // Check if the message contains placeholders for links and replace them
            let message = item.message;
            if (item.name === "LAMAR" && item.message.includes('<a href=\'#\' data-link-id=')) {
                message = this.replaceLinkPlaceholders(item.message);
            }

            if (item.name === "LAMAR") {
                html += '<div class="messages__item messages__item--visitor">' + message + '</div>'
            } else {
                html += '<div class="messages__item messages__item--operator">' + message + '</div>'
            }
          });

        const chatmessage = chatbox.querySelector('.chatbox__messages');
        chatmessage.innerHTML = html;
    }
}

const chatbox = new Chatbox();
chatbox.display();

document.addEventListener('DOMContentLoaded', function() {
    const chatbox = new Chatbox();
    chatbox.display();
});
