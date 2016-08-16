'use strict';

import config       from '../../config';
import changed      from 'gulp-changed';
import handleErrors from '../util/handleErrors';
import gulp         from 'gulp';
import browser      from 'browser-sync';
import plumber      from 'gulp-plumber';
import fontmin      from 'gulp-fontmin';
import notify       from 'gulp-notify';
import getSrcFiles  from '../util/getSrcFiles';

export default function (src = config.fonts.src, dest = config.fonts.dest, files = config.fonts.files, message = 'Fonts task complete') {
  return function () {
    let srcFiles = getSrcFiles(src, files);

    return gulp.src(srcFiles)
      .pipe(plumber({errorHandler: handleErrors}))
      .pipe(changed(dest)) // Ignore unchanged files
      .pipe(fontmin())
      .pipe(gulp.dest(dest))
      .pipe(browser.stream())
      .pipe(notify({
        title: config.notify.title,
        message: message,
        onLast: true
      }));
  };
}
