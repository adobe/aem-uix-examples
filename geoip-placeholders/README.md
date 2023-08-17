# GeoIP Placeholders for WKND Headless Applications

This application enables content authors to use placeholders for inserting dynamic data related to users' geolocation into Rich Text Field.

## AEM Pure Headless App

Location: https://aem-pure-headless.vercel.app/

## AEM Sample Headless App

Location: https://app.wknd.site/

### AEM Instance Preparation
1. Ensure your AEM instance has top-level CFs folder `Sample WKND App`. If folder with demo content exists - go to step #6.
2. Open AEM authoring instance.
3. Navigate to `Tools` (hummer icon on left toolbar), then `Deployment` and open `Packages`
4. Click on `Upload Packages` and select package from `resources/aem-demo-assets.ui.content.sample-wknd-app-1.0.19.zip`
5. After packages is uploaded click on `Install`
6. Open CF Admin (AEM Home Page > `Navigation` > `Content Fragments`)
7. Navigate to `/content/dam/sample-wknd-app/en/content-fragments/text-items` (`Sample WKND App > English > Content Fragments > text items >`)
8. Open `Mtn Biker in Canyon Title` in Cf Editor
9. From right rale navigate to Model Editor and click `Edit` when alert appeared
10. For `Content` field update Multi line text config `Default Type` to `Rich Text`
11. Back to CF Admin an click `Create`
...

