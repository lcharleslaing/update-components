#!/usr/bin/env node

import { program } from "commander";
import inquirer from "inquirer";
import shell from "shelljs";
import fs from "fs";
import path from "path";

program.version("1.0.0");

const templatesDir = "F:/nodejs/cli-projects/template-cli/templates";

function getSvelteProjects() {
  return fs
    .readdirSync(templatesDir, { withFileTypes: true })
    .filter(
      (dirent) => dirent.isDirectory() && dirent.name.startsWith("svelte")
    )
    .map((dirent) => path.join(templatesDir, dirent.name));
}

const config = {
  get projects() {
    return getSvelteProjects();
  },
};

function handleComponentAddition(componentPath, projectPath) {
  const targetPath = path.join(projectPath, "src", "lib", "components");
  const targetComponentPath = path.join(
    targetPath,
    path.basename(componentPath)
  );

  if (shell.test("-e", targetComponentPath)) {
    console.log(`Component already exists at ${targetComponentPath}`);
    inquirer
      .prompt([
        {
          type: "input",
          name: "newName",
          message:
            "Enter a new name for the component to avoid overwriting the existing one:",
        },
      ])
      .then((answers) => {
        const { newName } = answers;
        const newComponentPath = path.join(targetPath, newName);
        shell.cp("-R", componentPath, newComponentPath);
        console.log(`Component added with new name to ${projectPath}`);
      });
  } else {
    shell.cp("-R", componentPath, targetPath);
    console.log(`Component added to ${projectPath}`);
  }
}

function addComponent() {
  inquirer
    .prompt([
      {
        type: "input",
        name: "componentName",
        message: "Enter the name of the component:",
      },
    ])
    .then((answers) => {
      const { componentName } = answers;
      const componentPath = path.join(
        process.cwd(),
        "src",
        "lib",
        "components",
        componentName
      );

      if (!shell.test("-e", componentPath)) {
        console.error("Component does not exist at the specified path.");
        process.exit(1);
      }

      config.projects.forEach((projectPath) =>
        handleComponentAddition(componentPath, projectPath)
      );
    });
}

function handleRouteAddition(routePath, projectPath) {
  const targetPath = path.join(projectPath, "src", "routes");
  const targetRoutePath = path.join(targetPath, path.basename(routePath));

  if (shell.test("-e", targetRoutePath)) {
    console.log(`Route already exists at ${targetRoutePath}`);
    inquirer
      .prompt([
        {
          type: "input",
          name: "newName",
          message:
            "Enter a new name for the route to avoid overwriting the existing one:",
        },
      ])
      .then((answers) => {
        const { newName } = answers;
        const newRoutePath = path.join(targetPath, newName);
        shell.cp("-R", routePath, newRoutePath);
        console.log(`Route added with new name to ${projectPath}`);
      });
  } else {
    shell.cp("-R", routePath, targetPath);
    console.log(`Route added to ${projectPath}`);
  }
}

function addRoute() {
  inquirer
    .prompt([
      {
        type: "input",
        name: "routeName",
        message:
          "Enter the path of the route relative to the src/routes directory:",
      },
    ])
    .then((answers) => {
      const { routeName } = answers;
      const routePath = path.join(process.cwd(), "src", "routes", routeName);

      if (!shell.test("-e", routePath)) {
        console.error("Route does not exist at the specified path.");
        process.exit(1);
      }

      config.projects.forEach((projectPath) =>
        handleRouteAddition(routePath, projectPath)
      );
    });
}

function mainMenu() {
  inquirer
    .prompt({
      type: "list",
      name: "action",
      message: "Choose an action:",
      choices: [
        { name: "Add Component", value: "addComponent" },
        { name: "Add Route", value: "addRoute" },
        { name: "Exit", value: "exit" },
      ],
    })
    .then((answers) => {
      switch (answers.action) {
        case "addComponent":
          addComponent();
          break;
        case "addRoute":
          addRoute();
          break;
        case "exit":
          console.log("Exiting...");
          process.exit();
          break;
      }
    });
}

if (!process.argv.slice(2).length) {
  mainMenu();
} else {
  program.parse(process.argv);
}
