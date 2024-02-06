const fs = require("fs");

const exists = async (path) => {
  try {
    await fs.promises.access(path);
    return true;
  } catch (error) {
    return false;
  }
};

module.exports = async (config) => {
  const dist = config.web.distProd;

  if (!(await exists(dist))) {
    await fs.promises.mkdir(dist, { recursive: true });
  }
  if (!(await exists(dist + "/tinymce.min.js"))) {
    await fs.promises.cp("./node_modules/tinymce/tinymce.min.js", dist + "/tinymce.min.js");
  }

  if (!(await exists(dist + "/models"))) {
    await fs.promises.mkdir(dist + "/models");
    await fs.promises.cp("./node_modules/tinymce/models", dist + "/models", { recursive: true });
  }

  if (!(await exists(dist + "/plugins"))) {
    await fs.promises.mkdir(dist + "/plugins");
    await fs.promises.cp("./node_modules/tinymce/plugins", dist + "/plugins", { recursive: true });

    // replace the original ./node_modules/tinymce/plugins/link/plugin.js plugin with our modified version
    await fs.promises.rm(dist + "/plugins/link/plugin.min.js");
    await fs.promises.cp("./patches/tinymce/plugins/link/plugin.js", dist + "/plugins/link/plugin.min.js");
  }

  if (!(await exists(dist + "/themes"))) {
    await fs.promises.mkdir(dist + "/themes");
    await fs.promises.cp("./node_modules/tinymce/themes", dist + "/themes", { recursive: true });
  }

  if (!(await exists(dist + "/skins"))) {
    await fs.promises.mkdir(dist + "/skins");
    await fs.promises.cp("./node_modules/tinymce/skins", dist + "/skins", { recursive: true });
  }

  if (!(await exists(dist + "/icons"))) {
    await fs.promises.mkdir(dist + "/icons");
    await fs.promises.cp("./node_modules/tinymce/icons", dist + "/icons", { recursive: true });
  }
};
