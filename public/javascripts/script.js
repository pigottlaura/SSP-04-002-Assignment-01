jQuery(document).ready(function($){
    $(".updateSecret").hide();
    
    $( "#accordion" )
      .accordion({
        header: "> div > h3",
        collapsible: true,
        heightStyle: "content"
      })
    $(".editSecret").click(function(){
        var currentSecretText = $(this).prev().text();
        console.log("Secret " + this.id + " Clicked - " + currentSecretText);
        
        $(this).siblings(".updateSecret").show().css("display:block");
        
        $(this).siblings(".deleteSecret").hide();
        $(this).siblings(".secretText").hide();
        $(this).hide();
    });
    $(".cancel").click(function(){
        console.log("Cancel clicked");
        var originalSecretValue = $(this).parent().siblings(".secretText").text();
        $(this).parent().hide();
        $(this).parent().siblings(".updateSecret").hide();
        $(this).siblings(".newSecretText").val(originalSecretValue);
        
        $(this).parent().siblings(".deleteSecret").show();
        $(this).parent().siblings(".secretText").show();
        $(this).parent().siblings(".editSecret").show();
    });
});
        