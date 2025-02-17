{
    description = "Basic flake for Astro.js and Bun.js project";

    inputs = {
    nixpkgs.url = "github:nixos/nixpkgs?ref=nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
    };

    outputs = { self, nixpkgs, flake-utils }:
    flake-utils.lib.eachDefaultSystem (system:
        let
        pkgs = nixpkgs.legacyPackages.${system};
        in
        {
        devShells.default = pkgs.mkShell {
            buildInputs = with pkgs; [
                postgresql
                bun
                nodejs
            ];

            shellHook = ''
                echo 'Run bun run to get the commands to get started.'
            '';
        };
    });
}
