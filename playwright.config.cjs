const {defineConfig}=require('@playwright/test');
module.exports=defineConfig({
 testDir:'./tests/browser', timeout:30000, fullyParallel:false, workers:1,
 use:{baseURL:'http://127.0.0.1:4173',channel:process.env.PLAYWRIGHT_CHANNEL||'chrome',headless:true,viewport:{width:1440,height:900},trace:'retain-on-failure',screenshot:'only-on-failure'},
 webServer:{command:'node tests/serve.cjs',url:'http://127.0.0.1:4173',reuseExistingServer:!process.env.CI},
});
