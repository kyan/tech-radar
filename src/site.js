require('./common')
require('./images/logo.png')
require('./images/kyan.svg')
require('./images/kyanWhite.svg')
require('./images/radar_legend.png')
require('./gtm.js')

const GoogleSheetInput = require('./util/factory')
const GoogleAuth = require('./util/googleAuth');

GoogleAuth.loadGoogle(() => {
  GoogleSheetInput().build();
});
