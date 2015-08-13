var paypal = {
	initPaymentUI : function () {
    	var clientIDs = {
       		//"PayPalEnvironmentProduction": "YOUR_PRODUCTION_CLIENT_ID",
       		"PayPalEnvironmentSandbox": "AVzsotQbvm96ndbJKZRTKwA_0D1Ml1xwxlPh0P_DK0YAX9jTh4HntTWNtQ0CIaoVt-OTF8J-a_bW7ykD"
     	};
     	PayPalMobile.init(clientIDs, paypal.onPayPalMobileInit);
   	},
   	onSuccesfulPayment : function(payment) {
    	console.log("payment success: " + JSON.stringify(payment, null, 4));
   	},
   	onAuthorizationCallback : function(authorization) {
    	console.log("authorization: " + JSON.stringify(authorization, null, 4));
   	},
   	createPayment : function () {
    	// for simplicity use predefined amount
    	// optional payment details for more information check [helper js file](https://github.com/paypal/PayPal-Cordova-Plugin/blob/master/www/paypal-mobile-js-helper.js)
    	var paymentDetails = new PayPalPaymentDetails("50.00", "0.00", "0.00");
    	var payment = new PayPalPayment("50.00", "USD", "Awesome Sauce", "Sale", paymentDetails);
    	console.log("payment created!!!");
    	return payment;
   	},
   	configuration : function () {
    	// for more options see `paypal-mobile-js-helper.js`
    	var config = new PayPalConfiguration({merchantName: "My test shop", merchantPrivacyPolicyURL: "https://mytestshop.com/policy", merchantUserAgreementURL: "https://mytestshop.com/agreement"});
    	return config;
   	},
   	onPrepareRender : function() {
    	// buttons defined in index.html
    	//  <button id="buyNowBtn"> Buy Now !</button>
    	//  <button id="buyInFutureBtn"> Pay in Future !</button>
    	//  <button id="profileSharingBtn"> ProfileSharing !</button>
    	var buyNowBtn = document.getElementById("buyNowBtn");
     	var buyInFutureBtn = document.getElementById("buyInFutureBtn");
     	var profileSharingBtn = document.getElementById("profileSharingBtn");

     	buyNowBtn.onclick = function(e) {
       		// single payment
       		PayPalMobile.renderSinglePaymentUI(paypal.createPayment(), paypal.onSuccesfulPayment, paypal.onUserCanceled);
    	};

    	buyInFutureBtn.onclick = function(e) {
       		// future payment
       		PayPalMobile.renderFuturePaymentUI(paypal.onAuthorizationCallback, paypal.onUserCanceled);
     	};

     	profileSharingBtn.onclick = function(e) {
       		// profile sharing
       		PayPalMobile.renderProfileSharingUI(["profile", "email", "phone", "address", "futurepayments", "paypalattributes"], paypal.onAuthorizationCallback, app.onUserCanceled);
     	};
   	},
   	onPayPalMobileInit : function() {
    	// must be called
     	// use PayPalEnvironmentNoNetwork mode to get look and feel of the flow
     	PayPalMobile.prepareToRender("PayPalEnvironmentSandbox", paypal.configuration(), paypal.onPrepareRender);
   	},
   	onUserCanceled : function(result) {
    	console.log(result);
   	},
   	test : function(){
   		console.log("testing paypal.js!!");
   	}
};