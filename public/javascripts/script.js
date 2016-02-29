$(document).ready(function($){
    // Hiding all updateSecret forms by default, as they do not need to be
    // displayed until later (i.e. if a user clicks an editSecret button
    // within a secret)
    $(".updateSecret").hide();  
    
    // Using jQuery UI to set up the accordion structure of the list of 
    // secrets that will be displayed. Setting the header to be the contents
    // of the h3, allowing each accordion to be collapsible (i.e. you could
    // technically collapse all accordions, including the one you are currently
    // viewing). Setting the heightStyle to reflect that of the content, so 
    // that the accordion box will expand to display the full secret contents (as
    // the default behaviour is to just ad a scrollbar to the accordion box)
    $("#accordion").accordion({
        header: "> div > h3",
        collapsible: true,
        heightStyle: "content",
        active: false
    });
    
    // Using JQuery UI to generate the tab interface of the login / create account
    // sections on the home page of the website.
    $("#tabs").tabs();
    
    // Checking if the password and the confirmed password match before allowing a request for creating
    // a new account to be sent i.e. to ensure that the user does not make a mistake in their password
    
    // Validating the login form before it can be sent
    $("#login").submit(function(){
        // Defaulting the return result to false i.e. the form will not be allowed to be submitted
        // unless the below criteria are met
        var allowSubmit = false;
        
        // Removing any current warnings from the login tab
        $(this).siblings("p.warning").remove();
        
        // Checking if there has been text added to both the username and password inputs i.e.
        // you cannot login to an account without a username AND a password
        if($("#loginUsername").val().length > 0 && $("#loginPassword").val().length > 0){
            allowSubmit = true;
        } else {
            // Generating a warning on the form for the user
            $("<p class='warning'>You need to enter a username and a password to login to your account.</p>").insertBefore(this);
        }
        // Returning a boolean value, which if true will allow the form to be submitted, and if false
        // will stop the form from being submitted. If false, relevant warnings etc have been added above
        // so that the user know's why the form didn't submit.
        return allowSubmit;
    });
    
    // Validating the createAccount form before it can be sent
    $("#createAccount").submit(function() {
        // Defaulting the return result to false i.e. the form will not be allowed to be submitted
        // unless the below criteria are met
        var allowSubmit = false;
        
        // Removing any current warnings from the create account tab
        $(this).siblings("p.warning").remove();
        
        // Checking if there has been text added to both the username and password inputs i.e.
        // you cannot create an account without a username AND a password
        if($("#createUsername").val().length > 0 && $("#createPassword").val().length > 0){
            
            // Checking if the two password fields match i.e. that a user has correctly entered
            // their password twice
            if($("#createPassword").val() == $("#createConfirmPassword").val()){
                
                // If all of the above has resulted as true (i.e. there is a username and password
                // provided and the confirm password input matches the original password input)
                // setting the return value to true (i.e. this form is ok to submit)
                allowSubmit = true;
            } else{
                
                // Adding a warning message to notify the user that these passwords do not match.
                // As the return value was defaulted to false, this form will not be allowed 
                // to submit until the user rectifies this issue
                $("<p class='warning'>These passwords do not match. Please try again.</p>").insertBefore(this);
            }
        } else {
            
            // The user has not entered data into both the username AND password input boxes. Notifying
            // them that they need to enter both in order to create an account. As the return value was
            // defaulted to false, this form will not be allowed to submit until the user rectifies this 
            // issue
            $("<p class='warning'>You need to enter a username and a password to create a new account.</p>").insertBefore(this);
        }
        
        // Returning a boolean value, which if true will allow the form to be submitted, and if false
        // will stop the form from being submitted. If false, relevant warnings etc have been added above
        // so that the user know's why the form didn't submit.
        return allowSubmit;
    });
    
    // As all cookes appear to be stored in the document as one long string,
    // creating an array that stores all of the cookies as seperate elements.
    // Using the core JavaScript methods .replace() to remove all spaces from 
    // this string of data, and the .split() method to set the points at which 
    // this string of cookies needs to be seperated i.e. after each ;
    var allCookies = document.cookie.replace(/ /g, "").split(";");
    
    // Looping through the array of cookie name value pairs that I created earlier.
    for(var i = 0; i < allCookies.length; i++){
        // This this cookie's name starts with sortBy, then this is the cookie that
        // will specify the current sorting order of the secrets in the database
        if(allCookies[i].indexOf("sortBy") == 0)
        {
            // Getting the current value of the sortBy cookie, by using the core
            // JavaScript method .split() to break the cookie's name=value string into
            // two seperate parts. Opting to access the second part of this new array
            // i.e. index 1, as this is the part that contains the value of the cookie
            var sortBy = allCookies[i].split("=")[1];
            
            // Setting the current value of the sortSecretsBy select element to be equal
            // to that of the sortBy cookie. This is so that the select element will always
            // reflect the current sort method of the secrets, even when the page is refreshed
            $("#sortSecretsBy").val(sortBy);
        } else if (allCookies[i].indexOf("indexTab") == 0){
            var openTab = allCookies[i].split("=")[1];
            $("#tabs").tabs("option","active", openTab);
        }
    }
    
    // Everytime a user clicks on a secret's heading, triggering a click on all
    // "cancel" buttons (which only exist in the updateSecret form) so that 
    // no changes will be made, and that partial edits will not persist i.e.
    // the user would have to click "Save Changes" to retain the changes to their
    // secret, otherwise they will be lost when they leave the page/change secrets
    $("#accordion .group h3").click(function(){
        // Accessing all cancel buttons in all updateSecret forms
        $(".updateSecret .cancel").each(function(){
            // Triggering a click each of these buttons (so that the functionality 
            // defined in this script file for clicks on ".cancel" buttons will be
            // triggered)
            $(this).trigger("click");
        });
    });
    
    // Detecting clicks on editSecret buttons
    $(".editSecret").click(function(){
        // Hiding the deleteSecret button associated with this secret
        $(this).siblings(".deleteSecret").hide();
        // Hiding the secretText paragraph associated with this secret
        $(this).siblings(".secretText").hide();
        // Hiding the editSecret button that was just clicked
        $(this).hide();
        
        // Showing the updateSecret form assoicated with this secret, and
        // setting it's display mode to block, so that it will appear in 
        // place of the paragraph we have just hidden
        $(this).siblings(".updateSecret").show().css("display:block;");
    });
    
    // Detecting clicks on cancel buttons in the updateSecret form
    $(".updateSecret .cancel").click(function(){
        // Getting the original value of the secret's text from the paragraph
        // that it currently hidden
        var originalSecretValue = $(this).parent().siblings(".secretText").text();
        
        
        // Hiding the .updateSecret form
        $(this).parent().hide();
        // Resetting the value of the .updateSecret form's input "newSecretText"
        // to be equal to the original secret value of the paragraph i.e. resetting it
        $(this).siblings(".newSecretText").val(originalSecretValue);
        
        
        // Showing the original secretText paragraph
        $(this).parent().siblings(".secretText").show();
        // Showing the deleteSecret button
        $(this).parent().siblings(".deleteSecret").show();
        // Showing the .editSecret button
        $(this).parent().siblings(".editSecret").show();
    });
    
    // Setting up a listener so that when a user submits a request to sort their secrets,
    // the sortBy cookie can be updated with the relevant value i.e. sort by secretTitle
    // or sort by secretDescription, so that this preference can be passed to the server
    $("#sort").submit(function(){
        // Setting the document cookie "sortBy" to be equal to the current value of the 
        // sort secrets by option. Appending a path of "/" to it, as otherwise it
        // would default to "/users/secrets" as this is the page it would be on when this
        // function is called. If the path variable is different to the original cookie,
        // then this would be considered a new cookie
        document.cookie = "sortBy=" + $("#sortSecretsBy").val() + ";path=/";
        
        // Once the cookie has been updated, returning true so that the form can now be submitted
        return true;
    });
});
        