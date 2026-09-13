from PIL import Image

def remove_background():
    img_path = r"C:\Users\Nishad Soney\.gemini\antigravity-ide\brain\4e32b743-7b23-44b1-a669-833ce56b4af1\.user_uploaded\media_1789038810365.jpg"
    out_path = r"d:\HACKATHONS\IThackathon\smart-contract-vulnerability-detector-&-code-patching\public\monitor_transparent.png"
    
    img = Image.open(img_path)
    img = img.convert("RGBA")
    
    datas = img.getdata()
    newData = []
    
    # Define "white-ish" threshold
    threshold = 230
    
    for item in datas:
        # item is (R, G, B, A)
        if item[0] > threshold and item[1] > threshold and item[2] > threshold:
            # replacing it with a transparent pixel
            # smooth anti-aliasing can be complex, but simple threshold works for solid backgrounds
            newData.append((255, 255, 255, 0))
        else:
            newData.append(item)
            
    img.putdata(newData)
    img.save(out_path, "PNG")
    print("Saved transparent image to", out_path)

if __name__ == "__main__":
    remove_background()
