from PIL import Image
import sys

def remove_background(img_path, out_path):
    img = Image.open(img_path)
    img = img.convert("RGBA")
    
    datas = img.getdata()
    newData = []
    
    # White-ish threshold for the background
    threshold = 240
    
    for item in datas:
        if item[0] > threshold and item[1] > threshold and item[2] > threshold:
            newData.append((255, 255, 255, 0))
        else:
            newData.append(item)
            
    img.putdata(newData)
    img.save(out_path, "PNG")
    print("Saved transparent image to", out_path)

if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: python simple_bg_rem.py <input> <output>")
        sys.exit(1)
    remove_background(sys.argv[1], sys.argv[2])
