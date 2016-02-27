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
    
    $("#tabs").tabs();
    
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
            console.log("opening tab " + openTab);
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
    
    $("#sortSecretsBy").click(function(){
        document.cookie = "sortBy=" + $("#sortSecretsBy").val() + ";path=/";
    });
});
        