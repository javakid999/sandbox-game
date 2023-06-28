import pygame

image = pygame.image.load('./public/boards/water_lily.png')
pallete = []
real = []
pixels = []

for i in range(image.get_height()):
    for j in range(image.get_width()):
        color = image.get_at((j,i))
        if pallete.count(color) == 0:
            pallete.append(color)
        pixels.append(pallete.index(color))

print(image.get_width())
print(image.get_height())
print(pixels)
for color in pallete:
    real.append('rgb('+str(color.r)+','+str(color.g)+','+str(color.b)+')')
real[0] = 'white'
print(real)