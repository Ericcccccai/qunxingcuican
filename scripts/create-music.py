"""Render two original instrumental loops. Optional authoring tool: NumPy + ffmpeg.
No samples or third-party melodies. The shipped MP3 files need no runtime synthesis.
"""
from pathlib import Path
import numpy as np
import wave, subprocess, tempfile
SR=44100
ROOT=Path(__file__).resolve().parents[1]
# D minor jazz voicings: Dm9, Gm9, C9, Fmaj7, Bbmaj7, Em7b5, A7, Dm6.
CHORDS=[[50,57,60,64,65],[43,53,57,58,62],[48,55,58,62,64],[41,53,57,60,64],[46,53,57,62,65],[40,55,58,62,64],[45,55,61,64,67],[50,57,59,65,69]]
MELODY=[[74,77,81,79,77,76,73,74],[74,77,79,82,81,77,74,72],[76,79,82,81,79,76,74,72],[69,72,77,76,74,72,69,67],[70,74,77,81,79,77,74,72],[70,74,76,79,77,76,74,73],[73,76,79,82,81,79,76,73],[74,77,81,79,77,76,74,69]]
def render(name,bpm,night=False):
 beat=60/bpm;length=32*4*beat;n=int(length*SR);mix=np.zeros((n,2));rng=np.random.default_rng(923 if night else 411)
 def add(signal,at,volume,pan=0):
  # Circular tail accumulation creates a seamless musical loop.
  ids=(int(at*SR)+np.arange(len(signal)))%n
  mix[ids,0]+=signal*volume*np.sqrt((1-pan)/2);mix[ids,1]+=signal*volume*np.sqrt((1+pan)/2)
 def note(midi,at,dur,volume,kind='keys',pan=0):
  f=440*2**((midi-69)/12);t=np.arange(int(dur*SR))/SR
  if kind=='bass':
   y=(np.sin(2*np.pi*f*t)+.22*np.sin(4*np.pi*f*t))*np.exp(-t*5)*(1-np.exp(-t*130))
  elif kind=='pluck':
   y=(np.sin(2*np.pi*f*t)*np.exp(-t*4)+.28*np.sin(2*np.pi*f*2*t)*np.exp(-t*9)+.11*np.sin(2*np.pi*f*3*t)*np.exp(-t*17))*(1-np.exp(-t*350))
  else:
   y=(np.sin(2*np.pi*f*t)+.25*np.sin(2*np.pi*f*2.001*t)*np.exp(-t*5)+.07*np.sin(2*np.pi*f*4*t)*np.exp(-t*10))*np.exp(-t*(2.1 if night else 3.1))*(1-np.exp(-t*200))
  y[-min(len(y),300):]*=np.linspace(1,0,min(len(y),300));add(y,at,volume,pan)
 for bar in range(32):
  ch=CHORDS[bar%8];base=bar*4*beat
  for b in range(4):note(ch[0] if b in [0,2] else ch[0]+7,base+b*beat,.9,.17,'bass',-.1)
  for off in [0,1.65,3]:
   for j,p in enumerate(ch[1:]):note(p,base+off*beat+j*.012,1.1,.052 if night else .047,'keys',-.35)
  melody=MELODY[bar%8]
  for j,p in enumerate(melody):
   if (bar+j)%7==0 or (night and j in [3,7]):continue
   off=j*.5+(.085 if j%2 else 0)
   if bar>=16 and j in [0,4]:p+=12 if not night else 0
   note(p,base+off*beat,1.25 if night else .85,.115 if night else .10,'keys' if night else 'pluck',.28)
  for b in range(8):
   t=np.arange(int(.075*SR))/SR;noise=rng.normal(0,1,len(t));noise=np.diff(noise,prepend=0)
   add(noise*np.exp(-t*65)*(1-np.exp(-t*1000)),base+(b*.5+(.08 if b%2 else 0))*beat,.007 if night else .011,-.55)
  for b in [1,3]:
   t=np.arange(int(.13*SR))/SR;noise=rng.normal(0,1,len(t));soft=np.convolve(noise,np.ones(8)/8,'same');add(soft*np.exp(-t*30)*(1-np.exp(-t*250)),base+b*beat,.024 if night else .032,.45)
 # Gentle stereo room, with circular delays so the end joins the beginning.
 dry=mix.copy()
 for delay,vol in [(.079,.08),(.131,.06),(.211,.035)]:mix+=np.roll(dry[:,::-1],int(delay*SR),axis=0)*vol
 mix=np.tanh(mix*1.4);mix*=.68/max(np.max(np.abs(mix)),.001)
 with tempfile.TemporaryDirectory() as tmp:
  path=Path(tmp)/'loop.wav'
  with wave.open(str(path),'wb') as out:out.setnchannels(2);out.setsampwidth(2);out.setframerate(SR);out.writeframes((mix*32767).astype('<i2').tobytes())
  subprocess.run(['ffmpeg','-y','-loglevel','error','-i',str(path),'-codec:a','libmp3lame','-b:a','128k','-metadata','artist=反光板不是王座 原创配乐','-metadata','title='+name,str(ROOT/'assets'/f'{name}.mp3')],check=True)
 print(name,round(length,2),'seconds; peak',round(float(np.max(np.abs(mix))),3))
render('backstage',104)
render('afterhours',88,True)
