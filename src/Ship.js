function Ship(length) {
  if (length <= 0) {
    throw new Error("Invalid ship length");
  }
  const tiles = Array(length).fill(false);
  const hits = [];
  return {
    length,
    get hits() {
      return hits;
    },
    get tiles() {
      return tiles;
    },
    get isSunk() {
      return hits.length === length;
    },
    hit(position) {
      if (position < 0 || position >= length) {
        throw new Error("Invalid position");
      }
      if (tiles[position]) {
        throw new Error("Position already hit");
      }
      tiles[position] = true;
      hits.push(position);
    },
  };
}
export default Ship;
