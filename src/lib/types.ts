export type TetrominoType = "I" | "O" | "T" | "S" | "Z" | "J" | "L";

export type Board = (string | 0)[][];

export type Tetromino = {
  type: TetrominoType;
  rotation: number;
  row: number;
  col: number;
  shape: number[];
  color: string;
};
